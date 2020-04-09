import { Interaction } from "./interaction";



export class Move extends Interaction {
    private enableMove: boolean = false;
    private edgeOffset: number = 100;

    private curX: number;
    private curY: number;
    private minX: number;
    private maxX: number;
    private minY: number;
    private maxY: number;
    private containerWidth: number;
    private containerHeight: number;
    private position: [number, number];

    private moveType: { hor: boolean, ver: boolean } = { hor: false, ver: false };

    init(enableMove: boolean) {
        if(!enableMove) return;

        let container = this.renderer.getContainer(),
            globalShape = this.renderer.getGlobalShape();
            
        container.addEventListener('mousedown', (event: MouseEvent) => {
            let globalBound = globalShape.getBound(),
                [ scaleX, scaleY ] = globalShape.getScale(),
                scaledWidth = globalBound.width * scaleX,
                scaledHeight = globalBound.height * scaleY;

            this.containerWidth = this.renderer.getContainerWidth();
            this.containerHeight = this.renderer.getContainerHeight();
            this.position = globalShape.getPosition();
            this.minX = globalBound.x + this.position[0] + (scaledWidth - globalBound.width) / 2,
            this.maxX = this.minX + scaledWidth,
            this.minY = globalBound.y + this.position[1] + (scaledHeight - globalBound.height) / 2,
            this.maxY = this.minY + scaledHeight;
            this.curX = event.clientX;
            this.curY = event.clientY;

            if(this.minX < 0 || this.maxX > this.containerWidth) {
                this.moveType.hor = true;
            }
            if(this.minY < 0 || this.maxY > this.containerHeight) {
                this.moveType.ver = true;
            }

            if(this.moveType.hor || this.moveType.ver) {
                this.enableMove = true;
                this.interactionModel.setData('moving', true);
            }
        });

        container.addEventListener('mousemove', (event: MouseEvent) => {
            if(this.enableMove) {
                this.handle({
                    x: event.clientX,
                    y: event.clientY
                });
            }
        });

        container.addEventListener('mouseup', () => {
            this.reset();
        });

        container.addEventListener('mouseleave', () => {
            this.reset();
        });
    }

    response(param) {
        let dx = 0, dy = 0,
            globalShape = this.renderer.getGlobalShape();

        if(this.moveType.hor) {
            dx = param.x - this.curX;
            this.minX += dx;
            this.maxX += dx;

            if(this.minX > this.edgeOffset) {
                dx -= this.minX - this.edgeOffset;
                this.minX = this.edgeOffset;
            }
    
            if(this.maxX < this.containerWidth - this.edgeOffset) {
                dx -= this.maxX - (this.containerWidth - this.edgeOffset);
                this.maxX = this.containerWidth - this.edgeOffset;
            }
        }

        if(this.moveType.ver) {
            dy = param.y - this.curY;
            this.minY += dy;
            this.maxY += dy;

            if(this.minY > this.edgeOffset) {
                dy -= this.minY - this.edgeOffset;
                this.minY = this.edgeOffset;
            }
    
            if(this.maxY < this.containerHeight - this.edgeOffset) {
                dy -= this.maxY - (this.containerHeight - this.edgeOffset);
                this.maxY = this.containerHeight - this.edgeOffset;
            }
        }

        this.curX = param.x;
        this.curY = param.y;
        this.renderer.lastCenter[0] += dx;
        this.renderer.lastCenter[1] += dy;

        globalShape.translate(dx, dy);
    }

    /**
     * 重置所有数据
     */
    reset() {
        if(this.enableMove) {
            this.enableMove = false;
            this.interactionModel.setData('moving', false);
            this.moveType = { hor: false, ver: false };
        }
    }
}