import dataJson from '../data/datos.js';

// generic comparison function
const cmp = function (x, y) {
    return x > y ? 1 : x < y ? -1 : 0;
};

// --- Order data json
dataJson.sort(function (a, b) {
    //return a.category.localeCompare(b.category);
    return cmp(
        [cmp(a.category, b.category), cmp(a.subcategory, b.subcategory)],
        [cmp(b.category, a.category), cmp(b.subcategory, a.subcategory)]
    );
});

// --- Se construye una llave unica para segmentar la infomación
const customdata = []

dataJson.forEach(
    data => {
        customdata.push({ "customKey": `${data.category}|${data.subcategory}`, "pivotcolumn": data.pivotcolumn, "value": data.value })
    }
)

// --- Pivoteamos los datos basado en la "pivot column"
let pivotData = getPivotArray(customdata, "customKey", "pivotcolumn", "value", "");

// --- Se construye tabla
buildPivotTable("#pivotTableContainer", pivotData);

function getPivotArray(dataArray, rowIndex, colIndex, dataIndex, titlePivot) {

    var result = {}, ret = [];
    var newCols = [];
    for (var i = 0; i < dataArray.length; i++) {

        if (!result[dataArray[i][rowIndex]]) {
            result[dataArray[i][rowIndex]] = {};
        }
        result[dataArray[i][rowIndex]][dataArray[i][colIndex]] = dataArray[i][dataIndex];

        //To get column names
        if (newCols.indexOf(dataArray[i][colIndex]) == -1) {
            newCols.push(dataArray[i][colIndex]);
        }
    }

    newCols.sort();
    var item = [];

    //Add Header Row
    item.push(titlePivot);
    item.push.apply(item, newCols);
    ret.push(item);

    //Add content 
    for (var key in result) {
        item = [];
        item.push(key);

        for (var i = 0; i < newCols.length; i++) {
            item.push(result[key][newCols[i]] || "-");
        }
        ret.push(item);
    }
    return ret;
}

//Obtenemos contenido HTML para construir la nueva tabla
function buildPivotTable(tableContainer, Data) {
    const pivotTable = document.querySelector(tableContainer);
    pivotTable.innerHTML = ''

    var newThead = document.createElement("thead");
    var newTbody = document.createElement("tbody");

    // --- Construímos el cabecero de la tabla
    var counterHeader = 0;
    Data.every(
        pD => {
            counterHeader++;
            if (counterHeader === 1) {
                let newTr = document.createElement("tr");
                for (var i = 0; i < pD.length; i++) {
                    let newTh = document.createElement("th");

                    if(i === 0){
                        newTh.append(document.createTextNode("Category"))
                        newTh.setAttribute('class', 'subcategory')
                        newTr.appendChild(newTh)

                        let auxNewTh = document.createElement("th");
                        auxNewTh.append(document.createTextNode("Subcategory"))
                        auxNewTh.setAttribute('class', 'subcategory')
                        newTr.appendChild(auxNewTh)
                    }
                    else{
                        newTh.append(document.createTextNode(pD[i]))
                        newTh.setAttribute('class', 'value')
                        newTr.appendChild(newTh)
                    }     
                }

                newThead.appendChild(newTr);
                pivotTable.appendChild(newThead);
                return true;
            }
            else {
                return false;
            }

        }
    )

    // --- Encontramos los valores de las categoría para futura combinación de filas
    var categories = []
    var auxCounter1 = 0

    Data.forEach(
        n => {
            if (auxCounter1 > 0) {
                categories.includes(n[0]) ? null : categories.push(n[0])
            }
            auxCounter1++;
        }
    )

    // --- Completamos el resto de la tabla
    let counterContent = 0;
    var uniqueCategory = []

    Data.forEach(pD => {

        counterContent++;
        if (counterContent > 1) {
            let newBodyTr = document.createElement("tr");

            for (var i = 0; i < pD.length; i++) {
                let separados = pD[0].split('|');
                let category = separados[i]
                let subCategory = separados[i + 1]

                if (i === 0) {

                    if (!uniqueCategory.includes(category)) {

                        uniqueCategory.push(category)

                        let newTd = document.createElement("td");
                        newTd.setAttribute('rowSpan', `${categories.filter(
                            cat => {
                                let auxCat = cat.split('|')
                                return category === auxCat[0]
                            }
                        ).length}`);

                        newTd.setAttribute('class', 'category')
                        newTd.append(document.createTextNode(category));
                        newBodyTr.appendChild(newTd);
                    }

                    let newTd2 = document.createElement("td");
                    newTd2.setAttribute('class', 'subcategory')
                    newTd2.append(document.createTextNode(subCategory));
                    newBodyTr.appendChild(newTd2);
                }
                else {

                    const options = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 };
                    const numberFormat = new Intl.NumberFormat('en-EN', options);
                    const value = numberFormat.format(pD[i]) === "$NaN" ? "-" : numberFormat.format(pD[i])

                    let newTd = document.createElement("td");
                    newTd.setAttribute('class', 'value')
                    newTd.append(document.createTextNode(
                        value
                    ))
                    newBodyTr.appendChild(newTd)
                }

            }
            newTbody.appendChild(newBodyTr);
        }
    }
    );

    pivotTable.appendChild(newTbody);
}