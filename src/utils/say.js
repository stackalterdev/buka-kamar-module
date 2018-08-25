var satuan = ["nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
var belasan = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"];
var puluhan = ["", "", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"];
var ribuan = ["", "ribu", "juta", "milyar", "triliyun", "kuadrilyun", "kuintiliun", "sekstiliun", "septiliun", "oktiliun", "noniliun", "desiliun"];

function terbilang(d, f) {
    var strHasil = "";
    var isNegative = Number(d) < 0;
    d = parseFloat(Math.round(d * 100) / 100).toFixed(2)
    if (isNegative) {
        d = d * -1;
    }

    if (d.toString().indexOf(".") !== -1) {
        var a = Number(d.toString().substr(d.toString().indexOf(".") + 1));
        if (a !== 0) {
            strHasil = terbilangKoma(d);
        }
        d = Number(d.toString().slice(0, d.toString().indexOf(".")));
    }

    var nDigit = 0;
    var nPosisi = 0;

    var strTemp = Math.trunc(d).toString();
    for (var i = strTemp.length; i > 0; i--) {
        var tmpBuff = "";
        nDigit = parseInt(strTemp.substr(i - 1, 1), 10);
        nPosisi = (strTemp.length - i) + 1;
        switch (nPosisi % 3) {
            case 1:
                var bAllZeros = false;
                if (i == 1)
                    tmpBuff = satuan[nDigit] + " ";
                else if (strTemp.substr(i - 2, 1) == "1")
                    tmpBuff = belasan[nDigit] + " ";
                else if (nDigit > 0)
                    tmpBuff = satuan[nDigit] + " ";
                else {
                    bAllZeros = true;
                    if (i > 1)
                        if (strTemp.substr(i - 2, 1) != "0")
                            bAllZeros = false;
                    if (i > 2)
                        if (strTemp.substr(i - 3, 1) != "0")
                            bAllZeros = false;
                    tmpBuff = "";
                }

                if ((!bAllZeros) && (nPosisi > 1))
                    if ((strTemp.length == 4) && (strTemp.substr(0, 1) == "1"))
                        tmpBuff = "se" + ribuan[Math.round(nPosisi / 3)] + " ";
                    else
                        tmpBuff = tmpBuff + ribuan[Math.round(nPosisi / 3)] + " ";
                strHasil = tmpBuff + strHasil;
                break;
            case 2:
                if (nDigit > 0)
                    strHasil = (puluhan[nDigit] + " " + strHasil).trim();
                break;
            case 0:
                if (nDigit > 0)
                    if (nDigit == 1)
                        strHasil = "seratus " + strHasil;
                    else
                        strHasil = satuan[nDigit] + " ratus " + strHasil;
                break;
        }

    }
    if (f === "koma") {
        strHasil = `${f} ${strHasil}`.trim();
    } else {
        strHasil = ` ${strHasil} ${f ? f : "rupiah"}`.trim();
    }
    if (strTemp.length > 0) {
        if (isNegative) {
            strHasil = `minus ${strHasil}`;
        }
    }

    strHasil = strHasil.trim().toLowerCase();
    if (strHasil.length > 0) {
        strHasil = strHasil.substr(0, 1).toUpperCase() +
            strHasil.substr(1, strHasil.length - 1);
    }

    return strHasil;
}

function terbilangKoma(frac) {
    var a = frac.toString().substr(frac.toString().indexOf(".") + 1);
    var fixNumber = "";
    if (a.length > 4) {
        fixNumber = (frac.toFixed(4)).toString().substr((frac.toFixed(4)).toString().indexOf(".") + 1);
    } else {
        fixNumber = a;
    }
    var strHasil = "koma";
    for (var i = 0; i < fixNumber.length; i++) {
        var temp = Number(fixNumber[i]);
        strHasil = strHasil + " " + satuan[temp];
    }
    return strHasil;
}

module.exports = terbilang;
