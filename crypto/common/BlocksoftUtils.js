const Web3 = require('web3')

class BlocksoftUtils {

    static toBigNumber(val) {
        // noinspection JSCheckFunctionSignatures,JSUnresolvedVariable
        return new Web3.utils.BN(val)
    }

    static toSatoshi(val) {
        return this.fromUnified(val, 8)
    }

    static toBtc(val) {
        return this.toUnified(val, 8)
    }

    static toUnified(val, decimals = 8) {
        if (typeof (val) === 'undefined') {
            throw new Error('toUnified val is undefined')
        }
        if (typeof val === 'number') {
            val += ''
        }
        // noinspection JSUnresolvedVariable,JSCheckFunctionSignatures
        let added = ''
        let till = 18 - decimals
        if (till < 0) {
            throw new Error('toUnified till is less then 0, decimals = ' + decimals)
        }
        for (let i = 0; i < till; i++) {
            added += '0'
        }
        // noinspection JSUnresolvedVariable
        return Web3.utils.fromWei(val + added, 'ether')
    }

    static fromUnified(val, decimals = 8) {
        val = val.toString()
        let parts = val.split('.')
        let number = parts[0]
        if (!parts[1] || !parts[1].length) return (number + '0'.repeat(decimals))

        // fill the letters after point
        let letters = parts[1].split('')
        let needToFill = decimals
        for (let i = 0, ic = letters.length; i < ic; i++) {
            needToFill--
            number += letters[i]
            if (needToFill === 0) break
        }
        for (let i = 0; i < needToFill; i++) {
            number += '0'
        }

        // cut first 0
        let cutted = ''
        let started = false
        for (let i = 0, ic = number.length; i < ic; i++) {
            if (!started && number[i] === '0') continue
            cutted += number[i]
            started = true
        }

        return cutted
    }

    static toWei(val, from = 'ether') {
        if (typeof (val) === 'undefined') {
            throw new Error('toWei val is undefined')
        }
        if (typeof val === 'number') {
            val += ''
        }
        // noinspection JSUnresolvedVariable
        return Web3.utils.toWei(val, from)
    }

    static toGwei(val) {
        if (typeof val === 'number') {
            val += ''
        }

        // noinspection JSUnresolvedVariable
        let newVal
        try {
            // noinspection JSUnresolvedVariable,JSCheckFunctionSignatures
            newVal = Web3.utils.fromWei(val, 'gwei')
        } catch (e) {
            e.message = JSON.stringify(val) + ' ' + e.message
        }
        return newVal
    }

    static toEther(val) {
        if (typeof val === 'number') {
            val += ''
        }

        // noinspection JSUnresolvedVariable
        let newVal
        try {
            // noinspection JSUnresolvedVariable
            newVal = Web3.utils.fromWei(val, 'ether')
        } catch (e) {
            e.message = JSON.stringify(val) + ' ' + e.message
        }
        return newVal
    }

    static toDate(timeStamp) {
        if (timeStamp && timeStamp > 0) {
            return (new Date(timeStamp * 1000)).toISOString()
        } else {
            return new Date().toISOString()
        }
    }
}

export default BlocksoftUtils
