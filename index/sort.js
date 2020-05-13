
function bubbleSort(arr) {
    let tmp = null,
        len = arr.length,
        data = [];

    arr = arr.map(item => ({
        id: V.SV.Util.generateId(),
        data: item,
        swap: false
    }));

    data.push(arr.map(item => ({
        id: item.id,
        data: item.data,
        swap: item.swap
    })));

    for(let j = 0; j < len - 1; j++) {      //循环9次
        for(let i = 0; i < len - 1 - j; i++) {    //每次比较10-j-1次数
            if(arr[i].data > arr[i + 1].data) {
                tmp = arr[i + 1];
                arr[i + 1] = arr[i];
                arr[i] = tmp;

                arr[i].swap = true;
                arr[i + 1].swap = true;

                data.push(arr.map(item => ({
                    id: item.id,
                    data: item.data,
                    swap: item.swap
                })));

                arr[i].swap = false;
                arr[i + 1].swap = false;
            }
        }
    }

    data.push(arr.map(item => ({
        id: item.id,
        data: item.data,
        swap: item.swap
    })));

    return data;
}


function selectSort(arr) {
    let len = arr.length,
        min = null,
        tmp = null,
        data = [];

    arr = arr.map(item => ({
        id: V.SV.Util.generateId(),
        data: item,
        min: false
    }));

    data.push(arr.map(item => ({
        id: item.id,
        data: item.data,
        min: item.min
    })));

    //选择排序
    for(let j = 0; j < len - 1 ; j++){
        min = j;

        for(let i = j + 1; i < len; i++){
            if(arr[i].data < arr[min].data){
                min = i;
            }
        }

        arr[min].min = true;

        data.push(arr.map(item => ({
            id: item.id,
            data: item.data,
            min: item.min
        })));

        tmp = arr[j]
        arr[j] = arr[min];
        arr[min] = tmp;

        data.push(arr.map(item => ({
            id: item.id,
            data: item.data,
            min: item.min
        })));

        arr[j].min = false;
    }

    data.push(arr.map(item => ({
        id: item.id,
        data: item.data,
        min: item.min
    })));

    return data;
}