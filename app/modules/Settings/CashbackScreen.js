import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Clipboard,
    Dimensions,
    Vibration, RefreshControl, Linking
} from 'react-native'

import firebase from 'react-native-firebase'
import Share from 'react-native-share'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import NavStore from '../../components/navigation/NavStore'
import ButtonIcon from '../../components/elements/ButtonIcon'
import Navigation from '../../components/navigation/Navigation'
import CustomShare from '../../components/elements/Share'
import GradientView from '../../components/elements/GradientView'

import AuthActions from '../../appstores/Actions/AuthActions'
import { showModal } from '../../appstores/Actions/ModalActions'
import { setLoaderStatus } from '../../appstores/Actions/MainStoreActions'

import Log from '../../services/Log/Log'
import Toast from '../../services/Toast/Toast'
import Netinfo from '../../services/Netinfo/Netinfo'
import Cashback from '../../services/Cashback/Cashback'
import { strings } from '../../services/i18n'
import authDS from '../../appstores/DataSource/Auth/Auth'

const { width: SCREEN_WIDTH } = Dimensions.get("window")


class CashbackScreen extends Component {

    constructor(props){
        super(props);
        this.state = {
            visible: false,
            refreshing: false,
            shareOptions: {
                title: strings('cashback.shareTitle'),
                message: strings('cashback.shareMessage'),
                url: "..."
            },
            cashbackStatistics: {}
        }

        this.customShare = React.createRef()
        this.shareScrollView = React.createRef()
    }

    async componentWillMount() {

        const { logged } = this.props.authStore

        if(!logged) {
            showModal({ type: 'LOGIN_MODAL' })
            return false
        }

        setLoaderStatus(true)

        const authHash = await authDS.getAuthMnemonicHash()

        await Cashback.getCashbackData(authHash)

        setLoaderStatus(false)
    }

    handleRefresh = async () => {

        this.setState({
            refreshing: true
        })

        try {
            await Netinfo.isInternetReachable()

            const authHash = await authDS.getAuthMnemonicHash()

            await Cashback.getCashbackData(authHash)
        } catch (e) {
            Log.err('CashbackScreen/handleRefresh error')
        }

        this.setState({
            refreshing: false
        })
    }

    handleSignOut = async () => {
        try {
            await Netinfo.isInternetReachable()

            setLoaderStatus(true)

            await AuthActions.singOut()
            NavStore.goBack()

            setLoaderStatus(false)

        } catch (e) {
            Log.err('CashbackScreen.handleSignOut', e.message)
        }


    }

    componentDidMount() {
        setTimeout(() => {
            this.shareScrollView.scrollTo({x: SCREEN_WIDTH/50, y: 0, animated: false})
        }, 500)

    }

    handleCopyToClipboard = async () => {

        Clipboard.setString(this.props.cashbackStore.data.cashbackLink)

        Toast.setMessage(strings('toast.copied')).show()
    }

    handleLongCopyToClipboard = async () => {

        Clipboard.setString(this.props.cashbackStore.data.cashbackLink)

        Toast.setMessage(strings('toast.copied')).show()

        Vibration.vibrate(100)
    }

    handleShare = (social) => {
        const shareOptions = JSON.parse(JSON.stringify(this.state.shareOptions))

        shareOptions.url = this.props.cashbackStore.data.cashbackLink

        Share.shareSingle(Object.assign(shareOptions, { "social": social }))
    }

    handleSimpleShare = () => {
        const shareOptions = JSON.parse(JSON.stringify(this.state.shareOptions))

        shareOptions.url = this.props.cashbackStore.data.cashbackLink

        Share.open(shareOptions)
    }

    renderAuthComponent = () => {
        const { logged, authMnemonicHash } = this.props.authStore

        const wallets = JSON.parse(JSON.stringify(this.props.mainStore.wallets))
        const wallet = wallets.find(item => authMnemonicHash === item.wallet_hash)

        if(logged){
            return (
                <View style={styles.auth}>
                    <View>
                        <MaterialIcons name="verified-user" size={22} color="#fff" />
                    </View>
                    <View style={styles.auth__container}>
                        <Text style={styles.auth__title}>
                            { strings('auth.navigation.title', { authMnemonicName: wallet.wallet_name }) }
                        </Text>
                        <Text style={styles.auth__description}>
                            { strings('auth.navigation.description') }
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.auth__btn} onPress={() => this.handleSignOut()}>
                        <Text style={styles.auth__text}>
                            { strings('auth.logOut') }
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }

    telegramComponent = () => {
        return (
            <View style={{ alignItems: 'center', width: '100%' }}>
                <TouchableOpacity onPress={() => { Linking.openURL('https://t.me/trustee_wallet') }}>
                    <Text style={{ paddingTop: 10, paddingHorizontal: 10, fontFamily: 'SFUIDisplay-Semibold', color: '#4AA0EB' }}>@TrusteeWallet</Text>
                </TouchableOpacity>
            </View>
        )
    }

    handleWithdraw = () => {
        const { data: cashbackData} = this.props.cashbackStore
        const { localCurrencySymbol, localCurrencyRate, uahRate } = this.props.fiatRatesStore

        const minWithdraw = ((2 * uahRate) / localCurrencyRate).toFixed(2)

        if(cashbackData.cashbackBalance < 2 * uahRate){
            showModal({
                type: 'INFO_MODAL',
                icon: false,
                title: strings('modal.exchange.sorry'),
                description: strings('cashback.minWithdraw') + ' ' + minWithdraw + ' ' + localCurrencySymbol,
            })
        } else {
            showModal({
                type: 'INFO_MODAL',
                icon: null,
                title: strings('modal.titles.attention'),
                description: strings('cashback.performWithdraw'),
                component: this.telegramComponent
            })
        }
    }

    render() {
        firebase.analytics().setCurrentScreen('Settings.CashbackScreen')

        const { data: cashbackData} = this.props.cashbackStore
        const { localCurrencySymbol, localCurrencyRate } = this.props.fiatRatesStore

        return (
            <View style={styles.wrapper}>
                <Navigation title={ strings('cashback.pageTitle') }>
                    { this.renderAuthComponent() }
                </Navigation>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.wrapper__scrollView}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.handleRefresh}
                        />
                    }
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'space-between'
                    }}>
                    <CustomShare ref={ref => this.customShare = ref} link={this.props.cashbackStore.data.cashbackLink} />
                    {/*<View style={styles.wrapper__content__white} />*/}
                    <View style={styles.wrapper__top}>
                        <View>
                            <Image
                                style={styles.wrapper__img}
                                resizeMode='stretch'
                                source={require('../../assets/images/box.png')}
                            />
                        </View>
                        <View style={styles.wrapper__texts}>
                            <Text style={styles.wrapper__title}>
                                { strings('cashback.mainTitle') }
                            </Text>
                            <Text style={styles.wrapper__description}>
                                { strings('cashback.mainDescription') }
                            </Text>
                        </View>
                    </View>
                    <View style={styles.wrapper__bottom}>
                        <GradientView
                            array={styles.wrapper__bottom_bg.array}
                            start={styles.wrapper__bottom_bg.start}
                            end={styles.wrapper__bottom_bg.end}>
                            <View style={styles.wrapper__content__shadow} />
                            <GradientView style={styles.cashbackInfo}
                                          array={styles.cashbackInfoBg.array}
                                          start={styles.cashbackInfoBg.start}
                                          end={styles.cashbackInfoBg.end}>
                                    <View style={styles.cashbackInfo__row}>
                                        <View style={styles.cashbackInfo__content}>
                                            <View style={styles.cashbackInfo__item}>
                                                <Text style={[styles.cashbackInfo__text]} numberOfLines={1}>
                                                    { strings('cashback.transAmount') }
                                                </Text>
                                                <Text style={[styles.cashbackInfo__title]}>
                                                    {': '}
                                                    { 1 * (cashbackData.overalVolume / localCurrencyRate).toFixed(2) }{ localCurrencySymbol }
                                                </Text>
                                            </View>
                                            <View style={styles.cashbackInfo__item}>
                                                <Text style={[styles.cashbackInfo__text]} numberOfLines={1}>
                                                    { strings('cashback.cashbackAmount') }
                                                </Text>
                                                <Text style={[styles.cashbackInfo__title]}>
                                                    {': '}
                                                    { 1 * (cashbackData.cashbackBalance / localCurrencyRate).toFixed(cashbackData.cashbackBalance / localCurrencyRate > 1 ? 2 : 5) }{ localCurrencySymbol }
                                                </Text>
                                            </View>
                                            <View style={styles.cashbackInfo__item}>
                                                <Text style={[styles.cashbackInfo__text]} numberOfLines={1}>
                                                    { strings('cashback.friendsJoined') }
                                                </Text>
                                                <Text style={[styles.cashbackInfo__title]}>
                                                    {': '}
                                                    { cashbackData.invitedUsers }
                                                </Text>
                                            </View>
                                            <View style={styles.cashbackInfo__item}>
                                                <Text style={[styles.cashbackInfo__text]} numberOfLines={1}>
                                                    { strings('cashback.level2UsersAmount') }
                                                </Text>
                                                <Text style={[styles.cashbackInfo__title]}>
                                                    {': '}
                                                    { cashbackData.level2Users }
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.withdrawBtn} onPress={this.handleWithdraw}>
                                            <Text style={styles.withdrawBtn__text} numberOfLines={1}>
                                                { strings('cashback.withdraw').toUpperCase() }
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                            </GradientView>
                            <View style={styles.cashbackLink}>
                                <TouchableOpacity style={styles.cashbackLink__link} onLongPress={this.handleLongCopyToClipboard} onPress={() => { this.handleCopyToClipboard() }}>
                                        <Text style={styles.cashbackLink__text}>
                                            { cashbackData.cashbackLink.replace(/(.)(?=.)/g, "$1 ") }
                                        </Text>
                                </TouchableOpacity>
                                {/*<GradientView*/}
                                {/*    style={styles.cashbackLink__btn}*/}
                                {/*    array={styles.cashbackLink__btn_bg.array}*/}
                                {/*    start={styles.cashbackLink__btn_bg.start}*/}
                                {/*    end={styles.cashbackLink__btn_bg.end}>*/}
                                {/*    <TouchableOpacity*/}
                                {/*        style={styles.cashbackLink__btn__icon}*/}
                                {/*        onPress={() => { this.handleCopyToClipboard() }}>*/}
                                {/*        <MaterialCommunityIcons name='content-copy' size={25} color='#fff' />*/}
                                {/*    </TouchableOpacity>*/}
                                {/*</GradientView>*/}
                            </View>
                            <View style={styles.sharing}>
                                <View style={styles.sharing__top}>
                                    <View style={styles.sharing__line} /><Text style={styles.sharing__title}>{ strings('cashback.shareText') }</Text><View style={styles.sharing__line} />
                                </View>
                                <ScrollView
                                    ref={(ref) => {
                                        this.shareScrollView = ref
                                    }}
                                    contentContainerStyle={styles.sharing__content}
                                            horizontal={true}>
                                    <View style={styles.sharing__item}>
                                        <ButtonIcon style={{ backgroundColor: '#4AA0EB' }} icon="TELEGRAM" callback={() => this.customShare.handleShare('TELEGRAM')} />
                                        <Text style={styles.sharing__text}>Telegram</Text>
                                    </View>
                                    <View style={styles.sharing__item}>
                                        <ButtonIcon style={{ backgroundColor: '#1877f2' }} icon="FACEBOOK" callback={() => this.handleShare('facebook')} />
                                        <Text style={styles.sharing__text}>Facebook</Text>
                                    </View>
                                    {/*<View style={styles.sharing__item}>*/}
                                    {/*    <ButtonIcon style={{ backgroundColor: '#DF574E' }} icon="INSTAGRAM" callback={() => this.handleShare('instagram')} />*/}
                                    {/*    <Text style={styles.sharing__text}>Instagram</Text>*/}
                                    {/*</View>*/}
                                    <View style={styles.sharing__item}>
                                        <ButtonIcon style={{ backgroundColor: '#BA5DF5' }} icon="VIBER" callback={() => this.customShare.handleShare('VIBER')} />
                                        <Text style={styles.sharing__text}>Viber</Text>
                                    </View>
                                    <View style={styles.sharing__item}>
                                        <ButtonIcon style={{ backgroundColor: '#f55499' }} icon="DOTS" callback={() => this.handleSimpleShare()} />
                                        <Text style={styles.sharing__text}>{ strings('cashback.more') }</Text>
                                    </View>
                                </ScrollView>
                            </View>
                        </GradientView>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        mainStore: state.mainStore,
        cashbackStore: state.cashbackStore,
        authStore: state.authStore,
        fiatRatesStore: state.fiatRatesStore
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CashbackScreen)

const styles = {
    wrapper: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper__scrollView: {
        flex: 1,
        position: 'relative',

        marginTop: 120,
    },
    wrapper__top: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingLeft: 30,
        paddingRight: 30
    },
    wrapper__bottom: {
        position: 'relative',
        marginTop: 'auto',
        zIndex: 1
    },
    wrapper__bottom_bg: {
        array: ["#7127ac","#864dd9"],
        start: { x: 0, y: 1 },
        end: { x: 1, y: 1 }
    },
    wrapper__content__shadow: {
        width: '100%',
        height: 20,
        marginBottom: 25,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 7,
    },
    wrapper__content__white: {
        position: 'absolute',
        height: 10,
        bottom: 370,
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
        zIndex: 2
    },
    wrapper__title: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 19,
        color: '#404040'
    },
    wrapper__description: {
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 16,
        color: '#999999'
    },
    wrapper__img: {
        width: 240,
        height: 240
    },
    wrapper__texts: {
        width: '100%',
        marginTop: 20,
        marginBottom: 5
    },
    cashbackInfoBg: {
        array: ["#9e56cd","#9e56cd"],
        start: { x: 0, y: 1 },
        end: { x: 1, y: 1 }
    },
    cashbackInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',

        paddingTop: 5,
        paddingBottom: 2,
        paddingLeft: 30,
        paddingRight: 30,
        marginBottom: 25,
    },
    cashbackInfo__content: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cashbackInfo__row: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cashbackInfo__item: {
        position: 'relative',

        flexDirection: 'row',
        alignItems: 'center',

        marginBottom: 3,
    },
    cashbackInfo__title: {
        position: 'absolute',
        right: 5,
        top: 0,

        minWidth: 70,
        maxWidth: 70,

        fontSize: 11,
        color: '#fefdfd',
        fontFamily: 'SFUIDisplay-Semibold',
    },
    cashbackInfo__text: {
        marginRight: 5,
        paddingRight: 70,

        fontSize: 11,
        color: '#fefdfd',
        fontFamily: 'SFUIDisplay-Regular',
        textAlign: 'left'
    },
    cashbackInfo__line: {
        minWidth: 2,
        height: 25,

        backgroundColor: '#7127ac'
    },
    sharing__top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    sharing__title: {
        fontSize: 19,
        fontFamily: 'SFUIDisplay-Regular',
        color: '#fff'
    },
    sharing__content: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        paddingBottom: 24
    },
    sharing__item: {
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10
    },
    sharing__line: {
        flex: 1,
        height: 2,
        marginLeft: 25,
        marginRight: 25,
        backgroundColor: '#fff'
    },
    sharing__text: {
        marginTop: 5,
        fontFamily: 'SFUIDisplay-Regular',
        fontSize: 10,
        color: '#d7dbde'
    },
    cashbackLink: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 30,
        marginRight: 30,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 15,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    cashbackLink__link: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        height: '100%',
        padding: 15,
        paddingRight: 15,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#43156d',
        borderStyle: 'dashed',
    },
    cashbackLink__text: {
        flex: 1,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Semibold',
        fontSize: 14,
        letterSpacing: -1,
        color: '#7127ac',
    },
    cashbackLink__btn: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 54,
        height: '100%',
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
    },
    cashbackLink__btn__icon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    },
    cashbackLink__btn_bg: {
        array: ["#43156d","#7127ac"],
        start: { x: 0, y: 1 },
        end: { x: 1, y: 1 }
    },
    withdrawBtn: {
        flexDirection: 'row',
        alignItems: 'center',

        paddingVertical: 10,
        paddingHorizontal: 10,
        marginBottom: 3,

        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#9e56cd',
        borderStyle: 'solid',
        borderRadius: 40,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 7,
    },
    withdrawBtn__text: {
        fontFamily: 'SFUIDisplay-Semibold',

        color: '#9e56cd',
        fontSize: 12
    },
    auth: {
        position: 'absolute',
        top: 60,
        left: 0,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        width: '100%',
        height: 66,

        paddingTop: 20,
        paddingLeft: 25,
        paddingRight: 25,

        backgroundColor: '#f24b93',
        borderRadius: 15
    },
    auth__container: {
        flex: 1,

        marginLeft: 25,
        paddingRight: 25,
        marginRight: 'auto'
    },
    auth__title: {
        fontSize: 10,
        fontFamily: 'SFUIDisplay-Semibold',
        color: '#ffffff'
    },
    auth__description: {
        fontSize: 8,
        fontFamily: 'SFUIDisplay-Semibold',
        color: '#ffffff'
    },
    auth__btn: {
        alignItems: 'center',
        justifyContent: 'center',

        height: 28,

        marginTop: 7,
        marginBottom: 7,
        paddingLeft: 12,
        paddingRight: 12,

        borderRadius: 7,
        borderWidth: 1,
        borderColor: '#fff'
    },
    auth__text: {
        fontSize: 12,
        fontFamily: 'SFUIDisplay-Regular',
        color: '#ffffff'
    }
}
