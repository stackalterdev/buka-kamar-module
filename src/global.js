module.exports = {
    config: {
        locale: {
            name: 'id-ID',
            date: { 
                format: 'DD MMMM YYYY' 
            },
            currency: {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
            },
            currencyNotaItern: {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                minimumIntegerDigits:2 
            },
            currencyNotaItern2: {
                style: 'decimal',
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
            },
            decimal: {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            },
            currencySalesContract: {
                style: 'decimal',
                minimumFractionDigits: 3,
                maximumFractionDigits: 3
            }
        }
    }
}
