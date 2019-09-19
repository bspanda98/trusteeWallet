import React, { Component } from 'react'

import { connect } from 'react-redux'

import {
    Dimensions,
    Text,
    TouchableOpacity,
    View,
    Animated, Keyboard
} from 'react-native'

import GradientView from '../../../components/elements/GradientView'

import CustomFee from './customfee/CustomFee'

import { setLoaderStatus } from '../../../appstores/Actions/MainStoreActions'
import { setDataModal, showModal } from '../../../appstores/Actions/ModalActions'

import BlocksoftTransaction from '../../../../crypto/actions/BlocksoftTransaction/BlocksoftTransaction'
import BlocksoftBalances from '../../../../crypto/actions/BlocksoftBalances/BlocksoftBalances'
import BlocksoftPrettyNumbers from '../../../../crypto/common/BlocksoftPrettyNumbers'

import AntDesing from 'react-native-vector-icons/AntDesign'

import { strings } from '../../../services/i18n'

import Log from '../../../services/Log/Log'
import FiatRatesActions from '../../../appstores/Actions/FiatRatesActions'

const { width: WINDOW_WIDTH } = Dimensions.get('window')

class Fee extends Component {

    constructor(props) {
        super(props)
        this.state = {
            rateBTC: 0,
            rateETH : 0,
            feeList: [],
            fee: {},
            customFee: {},
            estimate: 0,
            status: 'none',

            ifCustomFee: false,
            ifShowFee: false,
            customFeeAnimation: new Animated.Value(0),
        }

        this.customFee = React.createRef()

    }

    async componentWillMount() {

        // setLoaderStatus(true)

        let rateBTC = 0
        let rateETH = 0
        if (typeof this.props.daemonStore.currencyRateDaemonData != 'undefined'
            && typeof this.props.daemonStore.currencyRateDaemonData.rates != 'undefined'
            && typeof this.props.daemonStore.currencyRateDaemonData.rates.allData != 'undefined'
            && typeof this.props.daemonStore.currencyRateDaemonData.rates.allData['BTC'] != 'undefined') {
            if (this.props.daemonStore.currencyRateDaemonData.rates.allData['BTC']) {
                rateBTC = this.props.daemonStore.currencyRateDaemonData.rates.allData['BTC']
            }
            if (this.props.daemonStore.currencyRateDaemonData.rates.allData['ETH']) {
                rateETH = this.props.daemonStore.currencyRateDaemonData.rates.allData['ETH']
            }
        }


        this.setState({
            rateBTC,
            rateETH
        })

        const {
            wallet_hash: walletHash
        } = this.props.wallet

        const {
            address,
            currency_code: currencyCode,
            derivation_path: derivationPath
        } = this.props.account

        const { sendData } = this.props

        const derivationPathTmp = derivationPath.replace(/quote/g, '\'')

        try {

            const tmpSetAmount = sendData.useAllFunds ? await BlocksoftBalances.setCurrencyCode(currencyCode).setAddress(address).getBalance() : sendData.amountRaw

            const addressTo = sendData.address ? sendData.address : address
            const fees = await (
                BlocksoftTransaction.setCurrencyCode(currencyCode)
                    .setWalletHash(walletHash)
                    .setDerivePath(derivationPathTmp)
                    .setAddressFrom(address)
                    .setAddressTo(addressTo)
                    .setAmount(tmpSetAmount)
            ).getFeeRate()

            Log.log('Send.Fee.componentWillMount fees', fees)

            if (fees) {
                this.setState({
                    feeList: fees,
                    fee: fees[2],
                    status: 'success'
                })
            }

        } catch (e) {
            Log.err('Send.Fee.componentWillMount', e)

            this.setState({
                status: 'fail'
            })

            showModal({
                type: 'INFO_MODAL',
                icon: false,
                title: 'Error',
                description: e.message
            })
        }

        setLoaderStatus(false)
    }

    handleTransferAll = async (fee) => {

        const {
            address,
            currency_code: currencyCode
        } = this.props.account

        const { sendData } = this.props

        const tmpData = JSON.parse(JSON.stringify(sendData))

        try {

            let amountRaw = await (
                BlocksoftBalances
                    .setCurrencyCode(currencyCode)
                    .setAddress(address)
                    .setFee(fee.feeForTx)
            ).getTransferAllBalance()

            const amount = BlocksoftPrettyNumbers.setCurrencyCode(currencyCode).makePrettie(amountRaw)

            tmpData.amount = amount
            tmpData.amountRaw = amountRaw

            setDataModal({
                data: {
                    type: 'CONFIRM_TRANSACTION_MODAL',
                    data: tmpData
                }
            })

        } catch (e) {
            Log.err('Send.Fee.handleTransferAll', e)

            Keyboard.dismiss()

            showModal({
                type: 'INFO_MODAL',
                icon: false,
                title: 'Error',
                description: JSON.stringify(e)
            })
        }

    }

    getFee = async () => {
        return this.state.ifCustomFee ? await this.getCustomFee() : this.state.fee
    }

    getCustomFee = () => {
        return this.customFee.handleGetCustomFee()
    }

    handleSelect = async (fee) => {

        const { useAllFunds } = this.props.sendData

        if (useAllFunds) {

            setLoaderStatus(true)

            await this.handleTransferAll(fee)

            setLoaderStatus(false)
        }

        this.setState({
            fee
        })
    }

    toggleCustomFee = () => {

        const { ifCustomFee } = this.state

        const position = !ifCustomFee ? -WINDOW_WIDTH + 60 : 0

        this.state.customFeeAnimation.setValue(!ifCustomFee ? 0 : -WINDOW_WIDTH + 60)
        Animated.timing( this.state.customFeeAnimation, { toValue: position, duration: 99}).start();

        this.setState({ ifCustomFee: !ifCustomFee })
    }

    toggleShowFee = () => {
        this.setState({
            ifShowFee: !this.state.ifShowFee
        })
    }

    render() {

        const { feeList, fee, status } = this.state
        const { currencySymbol, currency_rate_usd, currencyCode } = this.props.cryptocurrency
        const { localCurrencySymbol } = this.props.fiatRatesStore

        let feeSymbol = currencySymbol
        let feeCurrencyCode = currencyCode
        let feeRate = currency_rate_usd
        if (this.props.cryptocurrency.feesCurrencyCode) {
            feeSymbol = this.props.cryptocurrency.feesCurrencyCode
            feeCurrencyCode = this.props.cryptocurrency.feesCurrencyCode
            if ( typeof(this.state['rate' +  feeCurrencyCode]) !== 'undefined' ) { //rateBTC, rateETH etc
                feeRate = this.state['rate' +  feeCurrencyCode]
            } else {
                feeRate = 0
            }
        }

        return (
            <View style={styles.wrapper}>
                <View style={styles.fee__top}>
                    <TouchableOpacity
                        style={{ flex: 1, height: 40, paddingLeft: 15, justifyContent: 'center' }}
                        onPress={() => this.toggleShowFee()}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.fee__title}>{strings('send.fee.title')}</Text>
                            <View style={{ marginLeft: 5, marginBottom: this.state.ifShowFee ? -5 : 0 }}>
                                <AntDesing name={this.state.ifShowFee ? 'caretup' : 'caretdown'} size={13} color="#f4f4f4" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    {
                        this.state.ifShowFee ?
                            <TouchableOpacity
                                style={{height: 40, paddingRight: 15, justifyContent: 'center' }}
                                onPress={() => this.toggleCustomFee()}>
                                <View>
                                    {
                                        !this.state.ifCustomFee ?
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={styles.fee__title}>
                                                    { strings('send.fee.customFee.customFeeTitle') }
                                                </Text>
                                                <View style={{ marginLeft: 3, marginTop: 1 }}>
                                                    <AntDesing name="right" size={14} color="#f4f4f4" />
                                                </View>
                                            </View>
                                            :
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={{ marginRight: 3, marginTop: 1 }}>
                                                    <AntDesing name="left" size={14} color="#f4f4f4" />
                                                </View>
                                                <Text style={styles.fee__title}>
                                                    { strings('send.fee.customFee.fixedFeeTitle') }
                                                </Text>
                                            </View>
                                    }
                                </View>

                            </TouchableOpacity> : null
                    }

                </View>
                <View style={!this.state.ifShowFee ? styles.fee__content__wrap_hidden : styles.fee__content__wrap}>
                    <Animated.View style={{...styles.fee__content, transform: [{ translateX: this.state.customFeeAnimation }]}}>
                        {
                            status == 'success' ? feeList.map((item, index) => {
                                let prettieFee = BlocksoftPrettyNumbers.setCurrencyCode(feeCurrencyCode).makePrettie(item.feeForTx)
                                let feeInUsd = (prettieFee * feeRate).toFixed(3)
                                return (
                                    <View style={styles.fee__wrap} key={index}>
                                        <TouchableOpacity
                                            onPress={() => this.handleSelect(item)}
                                            disabled={fee.langMsg == item.langMsg ? true : false}
                                            style={styles.fee__item}>
                                            <GradientView
                                                style={styles.fee__circle}
                                                array={fee.langMsg == item.langMsg ? styles_active.array : styles_.array}
                                                start={styles_.start}
                                                end={styles_.end}>
                                            </GradientView>
                                            <View style={styles.fee__item__content}>
                                                <View style={styles.fee__item__top}>
                                                    <Text style={{ ...styles.fee__item__title, color: fee.langMsg == item.langMsg ? '#efa1ae' : '#f4f4f4' }}>
                                                        {strings(`send.fee.text.${item.langMsg}`)}
                                                    </Text>
                                                </View>
                                                <Text style={{ ...styles.fee__item__top__text, color: fee.langMsg == item.langMsg ? '#efa1ae' : '#f4f4f4' }}>
                                                    {strings(`send.fee.time.${item.langMsg}`)}
                                                </Text>
                                                <Text style={{ ...styles.fee__item__top__text, color: fee.langMsg == item.langMsg ? '#efa1ae' : '#e3e3e3' }}>
                                                    {prettieFee} {feeSymbol} ({ localCurrencySymbol } { FiatRatesActions.toLocalCurrency(feeInUsd) } )
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                        {feeList.length - 1 != index ? <View style={styles.fee__divider}/> : null}
                                    </View>
                                )
                            }) : null
                        }
                        {
                            status == 'fail' ? <Text> Error </Text> : null
                        }
                    </Animated.View>
                    <Animated.View style={{...styles.fee__content, transform: [{ translateX: this.state.customFeeAnimation }]}}>
                        <CustomFee
                            ref={ref => this.customFee = ref}
                            currencyCode={currencyCode}
                            fee={this.state.fee}
                            handleTransferAll={this.handleTransferAll}
                            useAllFunds={this.props.sendData.useAllFunds}/>
                    </Animated.View>
                </View>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        daemonStore: state.daemonStore,
        fiatRatesStore: state.fiatRatesStore
    }
}

export default connect(mapStateToProps, {}, null, { forwardRef: true })(Fee)

const styles_ = {
    array: ['#300f4d', '#300f4d'],
    start: { x: 0.0, y: 0.5 },
    end: { x: 1, y: 0.5 }
}

const styles_active = {
    array: ['#b95f94', '#eba0ae'],
    start: { x: 0.0, y: 0.5 },
    end: { x: 1, y: 0.5 }
}

const styles = {
    wrapper: {
        width: '100%',
        alignItems: 'flex-start'
    },
    fee__top: {
        //width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 5,
        marginTop: 10
    },
    fee__item__top: {
        flexDirection: 'row'
    },
    fee__title: {
        fontSize: 14,
        fontFamily: 'SFUIDisplay-Regular',
        color: '#e3e3e3',
        textAlign: 'left'
    },
    fee__btn_title: {
        fontSize: 10,
        fontFamily: 'SFUIDisplay-Bold',
        color: '#864dd9'
    },
    fee__content__wrap: {
        minHeight: 200,
        maxWidth: '100%',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        overflow: 'hidden'
    },
    fee__content__wrap_hidden: {
        minHeight: 0,
        maxHeight: 0,
        height: 0,
        overflow: 'hidden'
    },
    fee__content: {
        alignContent: 'flex-start',
        paddingLeft: 15,
        paddingRight: 15,
        minWidth: WINDOW_WIDTH - 60,
        marginBottom: 5,
        marginLeft: 0,
    },
    fee__wrap: {
        width: '100%',
        marginLeft: -15,
    },
    fee__item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 1,
        borderRadius: 9
    },
    fee__item__title: {
        fontSize: 18,
        fontFamily: 'SFUIDisplay-Regular',
        color: '#f4f4f4'
    },
    fee__item__top__text: {
        bottom: 2,
        fontSize: 12,
        fontFamily: 'SFUIDisplay-Regular',
        color: '#f4f4f4'
    },
    fee__active: {
        color: '#f4f4f4'
    },
    fee__item__number: {
        marginTop: 0,
        fontSize: 11,
        fontFamily: 'SFUIDisplay-Regular',
        color: '#e3e3e3'
    },
    fee__item__text: {
        marginTop: -3,
        fontSize: 11,
        fontFamily: 'SFUIDisplay-Regular',
        color: '#e3e3e3'
    },
    fee__divider: {
        marginTop: 6,
        marginBottom: 6,
        width: 1,
        backgroundColor: '#e3e6e9'
    },
    fee__circle: {
        width: 16,
        height: 16,
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 8
    },
    fd_row: {
        flexDirection: 'row'
    }
}
