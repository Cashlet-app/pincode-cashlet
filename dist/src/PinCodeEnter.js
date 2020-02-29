"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delay_1 = require("./delay");
const PinCode_1 = require("./PinCode");
const utils_1 = require("./utils");
const async_storage_1 = require("@react-native-community/async-storage");
const React = require("react");
const react_native_1 = require("react-native");
const Keychain = require("react-native-keychain");
const react_native_touch_id_1 = require("react-native-touch-id");
class PinCodeEnter extends React.PureComponent {
    constructor(props) {
        super(props);
        this.keyChainResult = undefined;
        this.triggerTouchID = () => {
            this.setState({
                cancelTouchID: false
            });
            react_native_touch_id_1.default.isSupported()
                .then(() => {
                setTimeout(() => {
                    this.launchTouchID();
                });
            })
                .catch((error) => {
                console.warn('TouchID error', error);
            });
        };
        this.endProcess = async (pinCode) => {
            if (!!this.props.endProcessFunction) {
                this.props.endProcessFunction(pinCode);
            }
            else {
                if (this.props.handleResult) {
                    this.props.handleResult(pinCode);
                }
                this.setState({ pinCodeStatus: utils_1.PinResultStatus.initial });
                this.props.changeInternalStatus(utils_1.PinResultStatus.initial);
                const pinAttemptsStr = await async_storage_1.default.getItem(this.props.pinAttemptsAsyncStorageName);
                let pinAttempts = pinAttemptsStr ? +pinAttemptsStr : 0;
                const pin = this.props.storedPin || this.keyChainResult;
                if (pin === pinCode) {
                    this.setState({ pinCodeStatus: utils_1.PinResultStatus.success });
                    async_storage_1.default.multiRemove([
                        this.props.pinAttemptsAsyncStorageName,
                        this.props.timePinLockedAsyncStorageName
                    ]);
                    this.props.changeInternalStatus(utils_1.PinResultStatus.success);
                    if (!!this.props.finishProcess)
                        this.props.finishProcess(pinCode);
                }
                else {
                    pinAttempts++;
                    if (+pinAttempts >= this.props.maxAttempts &&
                        !this.props.disableLockScreen) {
                        await async_storage_1.default.setItem(this.props.timePinLockedAsyncStorageName, new Date().toISOString());
                        this.setState({ locked: true, pinCodeStatus: utils_1.PinResultStatus.locked });
                        this.props.changeInternalStatus(utils_1.PinResultStatus.locked);
                    }
                    else {
                        await async_storage_1.default.setItem(this.props.pinAttemptsAsyncStorageName, pinAttempts.toString());
                        this.setState({ pinCodeStatus: utils_1.PinResultStatus.failure });
                        this.props.changeInternalStatus(utils_1.PinResultStatus.failure);
                    }
                    if (this.props.onFail) {
                        await delay_1.default(1500);
                        this.props.onFail(pinAttempts);
                    }
                }
            }
        };
        this.cancelTouchID = () => {
            this.setState({
                cancelTouchID: true
            });
        };
        this.changeAccount = () => {
            this.props.changeAccount();
        };
        this.handleShowTouchID = () => {
            this.setState({ showTouchID: true });
        };
        this.launchTouchID = async () => {
            const optionalConfigObject = {
                imageColor: '#01e576',
                imageErrorColor: '#ff0000',
                sensorDescription: 'Touch sensor for app',
                sensorErrorDescription: 'Failed',
                cancelText: this.props.textCancelButtonTouchID || 'Cancel',
                fallbackLabel: 'Show Passcode',
                unifiedErrors: false,
                passcodeFallback: true
            };
            try {
                await react_native_touch_id_1.default.authenticate(this.props.touchIDSentence, Object.assign({}, optionalConfigObject, {
                    title: this.props.touchIDTitle
                })).then((success) => {
                    this.endProcess(this.props.storedPin || this.keyChainResult);
                });
            }
            catch (e) {
                if (!!this.props.callbackErrorTouchId) {
                    this.props.callbackErrorTouchId(e);
                }
                else {
                    this.cancelTouchID();
                    console.log('TouchID error', e);
                }
            }
        };
        this.state = { pinCodeStatus: utils_1.PinResultStatus.initial, locked: false, cancelTouchID: false, showTouchID: false };
        this.endProcess = this.endProcess.bind(this);
    }
    async componentWillMount() {
        if (!this.props.storedPin) {
            const result = await Keychain.getInternetCredentials(this.props.pinCodeKeychainName);
            this.keyChainResult = result.password || undefined;
        }
    }
    componentDidMount() {
        // setTimeout(() => {
        //   if (!this.props.touchIDDisabled) this.triggerTouchID()
        // }, 2000);
    }
    componentDidUpdate(prevProps, prevState, prevContext) {
        if (prevProps.pinStatusExternal !== this.props.pinStatusExternal) {
            this.setState({ pinCodeStatus: this.props.pinStatusExternal });
        }
        if (prevProps.touchIDDisabled && !this.props.touchIDDisabled) {
            this.triggerTouchID();
        }
    }
    render() {
        const pin = this.props.storedPin || (this.keyChainResult && this.keyChainResult);
        return (React.createElement(react_native_1.View, { style: this.props.styleContainer
                ? this.props.styleContainer
                : styles.container },
            React.createElement(PinCode_1.default, { isTouchable: this.props.isTouchable, showTouchID: this.state.showTouchID, handleShowTouchID: this.handleShowTouchID, resetPass: this.props.resetPass, changeAccount: this.changeAccount, cancelTouchID: this.state.cancelTouchID, isEnter: this.props.isEnter, isReset: this.props.isReset, triggerTouchID: this.triggerTouchID, buttonDeleteComponent: this.props.buttonDeleteComponent || null, buttonDeleteText: this.props.buttonDeleteText, buttonNumberComponent: this.props.buttonNumberComponent || null, colorCircleButtons: this.props.colorCircleButtons, colorPassword: this.props.colorPassword || undefined, colorPasswordEmpty: this.props.colorPasswordEmpty, colorPasswordError: this.props.colorPasswordError || undefined, emptyColumnComponent: this.props.emptyColumnComponent, endProcess: this.endProcess, getCurrentLength: this.props.getCurrentLength, iconButtonDeleteDisabled: this.props.iconButtonDeleteDisabled, numbersButtonOverlayColor: this.props.numbersButtonOverlayColor || undefined, passwordComponent: this.props.passwordComponent || null, passwordLength: this.props.passwordLength || 4, pinCodeStatus: this.state.pinCodeStatus, pinCodeVisible: this.props.pinCodeVisible, previousPin: pin, sentenceTitle: this.props.title, status: PinCode_1.PinStatus.enter, styleButtonCircle: this.props.styleButtonCircle, styleCircleHiddenPassword: this.props.styleCircleHiddenPassword, styleCircleSizeEmpty: this.props.styleCircleSizeEmpty, styleCircleSizeFull: this.props.styleCircleSizeFull, styleColumnButtons: this.props.styleColumnButtons, styleColumnDeleteButton: this.props.styleColumnDeleteButton, styleColorButtonTitle: this.props.styleColorButtonTitle, styleColorButtonTitleSelected: this.props.styleColorButtonTitleSelected, styleColorSubtitle: this.props.styleColorSubtitle, styleColorSubtitleError: this.props.styleColorSubtitleError, styleColorTitle: this.props.styleColorTitle, styleColorTitleError: this.props.styleColorTitleError, styleContainer: this.props.styleContainerPinCode, styleDeleteButtonColorHideUnderlay: this.props.styleDeleteButtonColorHideUnderlay, styleDeleteButtonColorShowUnderlay: this.props.styleDeleteButtonColorShowUnderlay, styleDeleteButtonIcon: this.props.styleDeleteButtonIcon, styleDeleteButtonSize: this.props.styleDeleteButtonSize, styleDeleteButtonText: this.props.styleDeleteButtonText, styleEmptyColumn: this.props.styleEmptyColumn, stylePinCodeCircle: this.props.stylePinCodeCircle, styleRowButtons: this.props.styleRowButtons, styleTextButton: this.props.styleTextButton, styleTextSubtitle: this.props.styleTextSubtitle, styleTextTitle: this.props.styleTextTitle, styleViewTitle: this.props.styleViewTitle, subtitle: this.props.subtitle, subtitleComponent: this.props.subtitleComponent || null, subtitleError: this.props.subtitleError || 'Please try again', textPasswordVisibleFamily: this.props.textPasswordVisibleFamily, textPasswordVisibleSize: this.props.textPasswordVisibleSize, titleAttemptFailed: this.props.titleAttemptFailed || 'Incorrect PIN Code', titleComponent: this.props.titleComponent || null, titleConfirmFailed: this.props.titleConfirmFailed || 'Your entries did not match' })));
    }
}
exports.default = PinCodeEnter;
let styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
