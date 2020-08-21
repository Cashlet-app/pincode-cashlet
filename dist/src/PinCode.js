"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delay_1 = require("./delay");
const colors_1 = require("./design/colors");
const grid_1 = require("./design/grid");
const d3_ease_1 = require("d3-ease");
const _ = require("lodash");
const React = require("react");
const Animate_1 = require("react-move/Animate");
const react_native_1 = require("react-native");
const react_native_easy_grid_1 = require("react-native-easy-grid");
const thirdSize = react_native_1.Dimensions.get('window').width / 3 + 20;
var PinStatus;
(function (PinStatus) {
    PinStatus["choose"] = "choose";
    PinStatus["confirm"] = "confirm";
    PinStatus["enter"] = "enter";
})(PinStatus = exports.PinStatus || (exports.PinStatus = {}));
const textDeleteButtonDefault = 'delete';
class PinCode extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handlePincodeVisible = () => {
            const { isPincodeVisible } = this.state;
            this.setState({
                isPincodeVisible: !isPincodeVisible,
            });
        };
        this.failedAttempt = async () => {
            await delay_1.default(300);
            this.setState({
                showError: true,
                attemptFailed: true,
                changeScreen: false,
            });
            this.doShake();
            await delay_1.default(3000);
            this.newAttempt();
        };
        this.newAttempt = async () => {
            this.setState({ changeScreen: true });
            await delay_1.default(200);
            this.setState({
                changeScreen: false,
                showError: false,
                attemptFailed: false,
                password: '',
            });
        };
        this.onPressButtonNumber = async (text) => {
            const currentPassword = this.state.password + text;
            this.setState({ password: currentPassword });
            if (this.props.getCurrentLength)
                this.props.getCurrentLength(currentPassword.length);
            if (currentPassword.length === this.props.passwordLength) {
                switch (this.props.status) {
                    case PinStatus.choose:
                        if (this.props.validationRegex && this.props.validationRegex.test(currentPassword)) {
                            this.showError(true);
                        }
                        else {
                            console.log(currentPassword, 'currentPassword PinStatus.choose');
                            this.endProcess(currentPassword);
                        }
                        break;
                    case PinStatus.confirm:
                        if (currentPassword !== this.props.previousPin) {
                            this.showError();
                        }
                        else {
                            console.log(currentPassword, 'currentPassword PinStatus.confirm');
                            this.setState(() => ({
                                saveIsReady: true,
                                currentPassword,
                            }));
                        }
                        break;
                    case PinStatus.enter:
                        console.log(currentPassword, 'currentPassword PinStatus.enter');
                        this.props.endProcess(currentPassword);
                        await delay_1.default(300);
                        break;
                    default:
                        break;
                }
            }
        };
        this.renderButtonNumber = (text) => {
            const bigButton = +text % 2 === 0 && +text !== 0;
            const defaultStyle = bigButton
                ? [styles.buttonCircle, styles.bigButtonCircle]
                : styles.buttonCircle;
            const disabled = (this.state.password.length === this.props.passwordLength || this.state.showError) &&
                !this.state.attemptFailed;
            return (React.createElement(Animate_1.default, { show: true, start: {
                    opacity: 1,
                }, update: {
                    opacity: [this.state.showError && !this.state.attemptFailed ? 0.5 : 1],
                    timing: { duration: 200, ease: d3_ease_1.easeLinear },
                } }, ({ opacity }) => (React.createElement(react_native_1.TouchableHighlight, { style: [
                    this.props.styleButtonCircle ? this.props.styleButtonCircle : defaultStyle,
                    {
                        backgroundColor: this.props.colorCircleButtons
                            ? this.props.colorCircleButtons
                            : 'rgb(242, 245, 251)',
                    },
                ], underlayColor: this.props.numbersButtonOverlayColor
                    ? this.props.numbersButtonOverlayColor
                    : colors_1.colors.turquoise, disabled: disabled, onShowUnderlay: () => this.setState({ textButtonSelected: text }), onHideUnderlay: () => this.setState({ textButtonSelected: '' }), onPress: () => {
                    this.onPressButtonNumber(text);
                } },
                React.createElement(react_native_1.Text, { style: [
                        this.props.styleTextButton ? this.props.styleTextButton : styles.text,
                        {
                            opacity: opacity,
                            color: this.state.textButtonSelected === text
                                ? this.props.styleColorButtonTitleSelected
                                    ? this.props.styleColorButtonTitleSelected
                                    : colors_1.colors.white
                                : this.props.styleColorButtonTitle
                                    ? this.props.styleColorButtonTitle
                                    : colors_1.colors.grey,
                        },
                    ] }, text)))));
        };
        this.endProcess = (pwd) => {
            console.log('End Process');
            setTimeout(() => {
                this.setState({ changeScreen: true });
                setTimeout(() => {
                    this.props.endProcess(pwd);
                }, 500);
            }, 400);
        };
        this.renderCirclePassword = () => {
            const { password, moveData, showError, changeScreen, attemptFailed } = this.state;
            const colorPwdErr = this.props.colorPasswordError || colors_1.colors.alert;
            const colorPwd = this.props.colorPassword || colors_1.colors.turquoise;
            const colorPwdEmp = this.props.colorPasswordEmpty || '#C6C9DD';
            return (React.createElement(react_native_1.View, { style: this.props.styleCircleHiddenPassword
                    ? this.props.styleCircleHiddenPassword
                    : styles.topViewCirclePassword }, _.range(this.props.passwordLength).map((val) => {
                const lengthSup = ((password.length >= val + 1 && !changeScreen) || showError) && !attemptFailed;
                return (React.createElement(Animate_1.default, { key: val, show: true, start: {
                        opacity: 0.5,
                        height: this._circleSizeEmpty,
                        width: this._circleSizeEmpty,
                        borderRadius: this._circleSizeEmpty / 2,
                        color: this.props.colorPassword ? this.props.colorPassword : colors_1.colors.turquoise,
                        marginRight: 10,
                        marginLeft: 10,
                        x: 0,
                        y: 0,
                    }, update: {
                        x: [moveData.x],
                        opacity: [lengthSup ? 1 : 0.5],
                        height: [lengthSup ? this._circleSizeFull : this._circleSizeEmpty],
                        width: [lengthSup ? this._circleSizeFull : this._circleSizeEmpty],
                        color: [showError ? colorPwdErr : lengthSup ? colorPwd : colorPwdEmp],
                        borderRadius: [lengthSup ? this._circleSizeFull / 2 : this._circleSizeEmpty / 2],
                        marginRight: [
                            lengthSup ? 5 - (this._circleSizeFull - this._circleSizeEmpty) / 2 : 5,
                        ],
                        marginLeft: [
                            lengthSup ? 5 - (this._circleSizeFull - this._circleSizeEmpty) / 2 : 5,
                        ],
                        y: [moveData.y],
                        timing: { duration: 200, ease: d3_ease_1.easeLinear },
                    } }, ({ opacity, x, height, width, color, borderRadius, marginRight, marginLeft, }) => {
                    const backgroundColor = this.state.password[val] ? color : 'transparent';
                    return (React.createElement(react_native_1.View, { style: styles.viewCircles }, ((!this.state.isPincodeVisible ||
                        (this.state.isPincodeVisible && !lengthSup)) && (React.createElement(react_native_1.View, { style: [
                            {
                                left: x,
                                height: !this.state.isPincodeVisible ? height * 2.5 : height * 2.5,
                                width: !this.state.isPincodeVisible ? width * 2.5 : width * 2.5,
                                opacity: opacity,
                                borderRadius: !this.state.isPincodeVisible
                                    ? borderRadius * 2.5
                                    : borderRadius * 2.5,
                                marginLeft: 10,
                                marginRight: 10,
                                borderColor: !this.state.isPincodeVisible ? color : '#C6C9DD',
                                borderWidth: 2,
                                backgroundColor: !this.state.isPincodeVisible
                                    ? backgroundColor
                                    : 'transparent',
                            },
                            this.props.stylePinCodeCircle,
                        ] }))) || (React.createElement(react_native_1.View, { style: {
                            left: x,
                            opacity: opacity,
                            marginLeft: 10,
                            marginRight: 10,
                        } },
                        React.createElement(react_native_1.Text, { style: {
                                color: color,
                                fontFamily: this.props.textPasswordVisibleFamily || 'system font',
                                fontSize: this.props.textPasswordVisibleSize || 22,
                            } }, this.state.password[val])))));
                }));
            })));
        };
        this.renderButtonDelete = (opacity) => {
            opacity = opacity > 0.5 ? opacity - 0.3 : opacity - 0.2;
            return (React.createElement(react_native_1.TouchableHighlight, { disabled: this.state.password.length === 0, underlayColor: "transparent", onHideUnderlay: () => this.setState({
                    colorDelete: this.props.styleDeleteButtonColorHideUnderlay
                        ? this.props.styleDeleteButtonColorHideUnderlay
                        : 'rgb(211, 213, 218)',
                }), onShowUnderlay: () => this.setState({
                    colorDelete: this.props.styleDeleteButtonColorShowUnderlay
                        ? this.props.styleDeleteButtonColorShowUnderlay
                        : colors_1.colors.turquoise,
                }), onPress: () => {
                    if (this.state.password.length > 0) {
                        const newPass = this.state.password.slice(0, -1);
                        this.setState({ password: newPass });
                        if (this.props.getCurrentLength)
                            this.props.getCurrentLength(newPass.length);
                    }
                } },
                React.createElement(react_native_1.View, { style: this.props.styleColumnDeleteButton ? this.props.styleColumnDeleteButton : styles.colIcon }, !this.props.iconButtonDeleteDisabled && (React.createElement(react_native_1.Image, { source: require('./design/clear.png'), style: [styles.deleteButton, { opacity: opacity }] })))));
        };
        this.renderTitle = (colorTitle, opacityTitle, attemptFailed, showError) => {
            return (React.createElement(react_native_1.View, { style: styles.titleBox },
                React.createElement(react_native_1.Text, { style: [
                        this.props.styleTextTitle ? this.props.styleTextTitle : styles.textTitle,
                        { color: colorTitle, opacity: opacityTitle },
                    ] }, (attemptFailed && this.props.titleAttemptFailed) ||
                    (showError && this.props.titleConfirmFailed) ||
                    (showError && this.props.titleValidationFailed) ||
                    this.props.sentenceTitle)));
        };
        this.renderSubtitle = (colorTitle, opacityTitle, attemptFailed, showError) => {
            return (React.createElement(react_native_1.Text, { style: [
                    this.props.styleTextSubtitle ? this.props.styleTextSubtitle : styles.textSubtitle,
                    { color: colorTitle, opacity: opacityTitle },
                ] }, attemptFailed || showError ? this.props.subtitleError : this.props.subtitle));
        };
        this.renderTouchID = () => {
            return (React.createElement(react_native_1.TouchableOpacity, { style: {
                    flex: 1,
                    backgroundColor: colors_1.colors.turquoise,
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    zIndex: 999,
                }, onPress: () => { } },
                React.createElement(react_native_1.Image, { source: require('./design/touch-id.png'), style: { height: 250, width: 250 } })));
        };
        this.resetPass = () => {
            console.log(this.props.resetPass, '>>>>');
            this.props.resetPass();
        };
        this.state = {
            password: '',
            moveData: { x: 0, y: 0 },
            showError: false,
            textButtonSelected: '',
            colorDelete: this.props.styleDeleteButtonColorHideUnderlay
                ? this.props.styleDeleteButtonColorHideUnderlay
                : 'rgb(211, 213, 218)',
            attemptFailed: false,
            changeScreen: false,
            isPincodeVisible: false,
            saveIsReady: false,
            currentPassword: '',
        };
        this._circleSizeEmpty = this.props.styleCircleSizeEmpty || 6;
        this._circleSizeFull = this.props.styleCircleSizeFull || (this.props.pinCodeVisible ? 6 : 6);
    }
    componentDidMount() {
        if (this.props.getCurrentLength)
            this.props.getCurrentLength(0);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.pinCodeStatus !== 'failure' && this.props.pinCodeStatus === 'failure') {
            this.failedAttempt();
        }
        if (prevProps.pinCodeStatus !== 'locked' && this.props.pinCodeStatus === 'locked') {
            this.setState({ password: '' });
        }
        // if (prevProps.cancelTouchID === true && this.props.cancelTouchID === false) {
        //   this.setState(: false })
        // }
    }
    async doShake() {
        const duration = 70;
        react_native_1.Vibration.vibrate(500, false);
        const length = react_native_1.Dimensions.get('window').width / 3;
        await delay_1.default(duration);
        this.setState({ moveData: { x: length, y: 0 } });
        await delay_1.default(duration);
        this.setState({ moveData: { x: -length, y: 0 } });
        await delay_1.default(duration);
        this.setState({ moveData: { x: length / 2, y: 0 } });
        await delay_1.default(duration);
        this.setState({ moveData: { x: -length / 2, y: 0 } });
        await delay_1.default(duration);
        this.setState({ moveData: { x: length / 4, y: 0 } });
        await delay_1.default(duration);
        this.setState({ moveData: { x: -length / 4, y: 0 } });
        await delay_1.default(duration);
        this.setState({ moveData: { x: 0, y: 0 } });
        if (this.props.getCurrentLength)
            this.props.getCurrentLength(0);
    }
    async showError(isErrorValidation = false) {
        this.setState({ changeScreen: true });
        await delay_1.default(300);
        this.setState({ showError: true, changeScreen: false });
        this.doShake();
        await delay_1.default(3000);
        this.setState({ changeScreen: true });
        await delay_1.default(200);
        this.setState({ showError: false, password: '' });
        await delay_1.default(200);
        this.props.endProcess(this.state.password, isErrorValidation);
        if (isErrorValidation)
            this.setState({ changeScreen: false });
    }
    render() {
        const { password, showError, attemptFailed, changeScreen, isPincodeVisible, saveIsReady, } = this.state;
        const saveText = this.props.isRegister ? 'Create passcode' : 'Confirm passcode';
        return (React.createElement(react_native_1.View, { style: this.props.styleContainer ? this.props.styleContainer : styles.container },
            this.props.showTouchID && !this.props.cancelTouchID ? this.renderTouchID() : null,
            React.createElement(Animate_1.default, { show: true, start: {
                    opacity: 0,
                    colorTitle: this.props.styleColorTitle ? this.props.styleColorTitle : colors_1.colors.greyTitle,
                    colorSubtitle: this.props.styleColorSubtitle
                        ? this.props.styleColorSubtitle
                        : colors_1.colors.greyTitle,
                    opacityTitle: 1,
                }, enter: {
                    opacity: [1],
                    colorTitle: [
                        this.props.styleColorTitle ? this.props.styleColorTitle : colors_1.colors.greyTitle,
                    ],
                    colorSubtitle: [
                        this.props.styleColorSubtitle ? this.props.styleColorSubtitle : colors_1.colors.greyTitle,
                    ],
                    opacityTitle: [1],
                    timing: { duration: 200, ease: d3_ease_1.easeLinear },
                }, update: {
                    opacity: [changeScreen ? 0 : 1],
                    colorTitle: [
                        showError || attemptFailed
                            ? this.props.styleColorTitleError
                                ? this.props.styleColorTitleError
                                : colors_1.colors.alert
                            : this.props.styleColorTitle
                                ? this.props.styleColorTitle
                                : colors_1.colors.greyTitle,
                    ],
                    colorSubtitle: [
                        showError || attemptFailed
                            ? this.props.styleColorSubtitleError
                                ? this.props.styleColorSubtitleError
                                : colors_1.colors.alert
                            : this.props.styleColorSubtitle
                                ? this.props.styleColorSubtitle
                                : colors_1.colors.greyTitle,
                    ],
                    opacityTitle: [showError || attemptFailed ? grid_1.grid.highOpacity : 1],
                    timing: { duration: 200, ease: d3_ease_1.easeLinear },
                } }, ({ opacity, colorTitle, colorSubtitle, opacityTitle }) => (React.createElement(react_native_1.View, { style: [
                    this.props.styleViewTitle ? this.props.styleViewTitle : styles.viewTitle,
                    { opacity: opacity },
                ] }, this.props.titleComponent
                ? this.props.titleComponent()
                : this.renderTitle(colorTitle, opacityTitle, attemptFailed, showError)))),
            React.createElement(react_native_1.View, { style: styles.flexCirclePassword },
                React.createElement(react_native_1.View, { style: styles.borderViewLeft },
                    React.createElement(react_native_1.View, { style: styles.border })),
                this.props.passwordComponent
                    ? this.props.passwordComponent()
                    : this.renderCirclePassword(),
                React.createElement(react_native_1.View, { style: styles.borderViewRight }, !isPincodeVisible ? (React.createElement(react_native_1.TouchableOpacity, { onPress: () => this.handlePincodeVisible(), style: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' } },
                    React.createElement(react_native_1.Image, { source: require('./design/hide.png'), style: styles.visibleIcon }),
                    React.createElement(react_native_1.View, { style: styles.border }))) : (React.createElement(react_native_1.TouchableOpacity, { onPress: () => this.handlePincodeVisible(), style: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' } },
                    React.createElement(react_native_1.Image, { source: require('./design/watch.png'), style: styles.visibleIcon }),
                    React.createElement(react_native_1.View, { style: styles.border }))))),
            React.createElement(react_native_easy_grid_1.Grid, { style: styles.grid },
                React.createElement(react_native_easy_grid_1.Row, { style: this.props.styleRowButtons ? this.props.styleRowButtons : styles.row }, _.range(1, 4).map((i) => {
                    return (React.createElement(react_native_easy_grid_1.Col, { key: i, style: this.props.styleColumnButtons
                            ? this.props.styleColumnButtons
                            : styles.colButtonCircle }, this.props.buttonNumberComponent
                        ? this.props.buttonNumberComponent(i, this.onPressButtonNumber)
                        : this.renderButtonNumber(i.toString())));
                })),
                React.createElement(react_native_easy_grid_1.Row, { style: this.props.styleRowButtons ? this.props.styleRowButtons : styles.row }, _.range(4, 7).map((i) => {
                    return (React.createElement(react_native_easy_grid_1.Col, { key: i, style: this.props.styleColumnButtons
                            ? this.props.styleColumnButtons
                            : styles.colButtonCircle }, this.props.buttonNumberComponent
                        ? this.props.buttonNumberComponent(i, this.onPressButtonNumber)
                        : this.renderButtonNumber(i.toString())));
                })),
                React.createElement(react_native_easy_grid_1.Row, { style: this.props.styleRowButtons ? this.props.styleRowButtons : styles.row }, _.range(7, 10).map((i) => {
                    return (React.createElement(react_native_easy_grid_1.Col, { key: i, style: this.props.styleColumnButtons
                            ? this.props.styleColumnButtons
                            : styles.colButtonCircle }, this.props.buttonNumberComponent
                        ? this.props.buttonNumberComponent(i, this.onPressButtonNumber)
                        : this.renderButtonNumber(i.toString())));
                })),
                React.createElement(react_native_easy_grid_1.Row, { style: this.props.styleRowButtons ? this.props.styleRowButtons : styles.row },
                    React.createElement(react_native_easy_grid_1.Col, { style: this.props.styleEmptyColumn ? this.props.styleEmptyColumn : styles.colEmpty }, this.props.emptyColumnComponent || null),
                    React.createElement(react_native_easy_grid_1.Col, { style: this.props.styleColumnButtons
                            ? this.props.styleColumnButtons
                            : styles.colButtonCircle }, this.props.buttonNumberComponent
                        ? this.props.buttonNumberComponent('0', this.onPressButtonNumber)
                        : this.renderButtonNumber('0')),
                    React.createElement(react_native_easy_grid_1.Col, { style: this.props.styleColumnButtons
                            ? this.props.styleColumnButtons
                            : styles.colButtonCircle },
                        React.createElement(Animate_1.default, { show: true, start: {
                                opacity: 0.5,
                            }, update: {
                                opacity: [
                                    password.length === 0 || password.length === this.props.passwordLength
                                        ? 0.5
                                        : 1,
                                ],
                                timing: { duration: 400, ease: d3_ease_1.easeLinear },
                            } }, ({ opacity }) => this.props.buttonDeleteComponent
                            ? this.props.buttonDeleteComponent(() => {
                                if (this.state.password.length > 0) {
                                    const newPass = this.state.password.slice(0, -1);
                                    this.setState({ password: newPass });
                                    if (this.props.getCurrentLength)
                                        this.props.getCurrentLength(newPass.length);
                                }
                            })
                            : this.renderButtonDelete(opacity))))),
            React.createElement(react_native_1.View, { style: styles.bottomBox }, this.props.isEnter ? (React.createElement(react_native_1.View, { style: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                } }, this.props.isTouchable ? (React.createElement(React.Fragment, null,
                React.createElement(react_native_1.View, { style: styles.borderViewLeft },
                    React.createElement(react_native_1.View, { style: styles.borderBottom })),
                React.createElement(react_native_1.View, { style: {
                        justifyContent: 'center',
                        alignItems: 'stretch',
                        width: thirdSize,
                        flexDirection: 'row',
                    } },
                    React.createElement(react_native_1.TouchableOpacity, { style: { marginHorizontal: 10 }, onPress: this.props.resetPass }, this.props.resetTitle
                        ? React.createElement(react_native_1.Text, { style: {
                                color: colors_1.colors.grey,
                                fontSize: 14,
                                textAlign: 'center',
                                fontFamily: 'Comfortaa',
                            } },
                            " ",
                            this.props.resetTitle)
                        : React.createElement(react_native_1.Image, { source: require('./design/lost.png'), style: { height: 40, width: 40 } })),
                    React.createElement(react_native_1.View, { style: styles.borderViewCenter },
                        React.createElement(react_native_1.View, { style: styles.borderCenter })),
                    React.createElement(react_native_1.TouchableOpacity, { style: { marginHorizontal: 10 }, onPress: () => {
                            // this.props.handleShowTouchID();
                            this.props.triggerTouchID();
                        } },
                        React.createElement(react_native_1.Image, { source: require('./design/fingerprint.png'), style: { height: 40, width: 40 } }))),
                React.createElement(react_native_1.View, { style: styles.borderViewRight },
                    React.createElement(react_native_1.View, { style: styles.borderBottom })))) : (React.createElement(React.Fragment, null,
                React.createElement(react_native_1.View, { style: styles.borderViewLeft },
                    React.createElement(react_native_1.View, { style: styles.borderBottom })),
                React.createElement(react_native_1.View, { style: {
                        justifyContent: 'center',
                        alignItems: 'stretch',
                        width: thirdSize,
                        flexDirection: 'row',
                    } },
                    React.createElement(react_native_1.TouchableOpacity, { style: { marginHorizontal: 10 }, onPress: this.props.resetPass }, this.props.resetTitle
                        ? React.createElement(react_native_1.Text, { style: {
                                color: colors_1.colors.grey,
                                fontSize: 14,
                                textAlign: 'center',
                                fontFamily: 'Comfortaa',
                            } },
                            " ",
                            this.props.resetTitle)
                        : React.createElement(react_native_1.Image, { source: require('./design/lost.png'), style: { height: 40, width: 40 } }))),
                React.createElement(react_native_1.View, { style: styles.borderViewRight },
                    React.createElement(react_native_1.View, { style: styles.borderBottom })))))) : (React.createElement(React.Fragment, null, saveIsReady ? (React.createElement(react_native_1.TouchableOpacity, { style: [
                    { backgroundColor: saveIsReady ? colors_1.colors.turquoise : 'rgba(234,237,251, 0.8)' },
                    styles.saveButton,
                ], disabled: !saveIsReady, onPress: () => {
                    this.endProcess(this.state.currentPassword);
                } },
                React.createElement(react_native_1.Text, { style: {
                        color: saveIsReady ? colors_1.colors.white : colors_1.colors.dark,
                        fontSize: 16,
                        textAlign: 'center',
                        fontFamily: 'Comfortaa',
                    } }, this.props.isReset ? 'Enter new passcode' : `${saveText}`))) : null))),
            this.props.isEnter ? (React.createElement(react_native_1.View, { style: { flex: 1, justifyContent: 'center', alignItems: 'center' } },
                React.createElement(react_native_1.TouchableOpacity, { onPress: () => this.props.changeAccount(), style: { marginBottom: 20, padding: 15 } },
                    React.createElement(react_native_1.Text, { style: {
                            color: colors_1.colors.grey,
                            fontSize: 14,
                            textAlign: 'center',
                            fontFamily: 'Comfortaa',
                        } }, "Change account")))) : null));
    }
}
exports.default = PinCode;
let styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    viewTitle: {
        marginTop: 10,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 2,
    },
    row: {
        alignItems: 'center',
        height: grid_1.grid.unit * 4.5,
    },
    colButtonCircle: {
        marginLeft: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: grid_1.grid.unit * 3.5,
        height: grid_1.grid.unit * 3,
    },
    colEmpty: {
        marginLeft: grid_1.grid.unit / 2,
        marginRight: grid_1.grid.unit / 2,
        width: grid_1.grid.unit * 3.5,
        height: grid_1.grid.unit * 3,
    },
    colIcon: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    text: {
        fontSize: 24,
        fontFamily: 'Comfortaa-light',
        color: '#4B5E7F',
    },
    buttonCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        backgroundColor: 'rgb(242, 245, 251)',
        borderRadius: 25,
        borderWidth: 4,
        borderColor: '#DDDFED',
        paddingBottom: 3,
    },
    bigButtonCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    textTitle: {
        fontSize: 24,
        fontWeight: '200',
        lineHeight: 26,
        textAlign: 'center',
        fontFamily: 'Comfortaa',
    },
    titleBox: {
        marginVertical: 20,
        marginHorizontal: grid_1.grid.unit * 2.5,
    },
    textSubtitle: {
        fontSize: grid_1.grid.unit,
        fontWeight: '200',
        textAlign: 'center',
    },
    flexCirclePassword: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'stretch',
        flexDirection: 'row',
    },
    topViewCirclePassword: {
        flexDirection: 'row',
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewCircles: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        height: 45,
        width: 45,
    },
    textDeleteButton: {
        fontWeight: '200',
        marginTop: 5,
    },
    grid: {
        width: '100%',
        flex: 7,
    },
    visibleIcon: {
        height: 32,
        width: 32,
        marginRight: 10,
    },
    borderViewRight: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'flex-end',
        marginHorizontal: 10,
    },
    borderViewLeft: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'flex-start',
        marginHorizontal: 10,
    },
    border: {
        backgroundColor: '#ccc',
        height: 2,
        width: 40,
    },
    borderBottom: {
        backgroundColor: '#ccc',
        height: 2,
        width: 80,
    },
    borderViewCenter: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'flex-start',
        marginHorizontal: 5,
    },
    borderCenter: {
        backgroundColor: '#ccc',
        height: 2,
        width: 20,
    },
    saveButton: {
        paddingHorizontal: 50,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 20,
    },
    bottomBox: {
        flex: 1,
        marginTop: 10,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
});
