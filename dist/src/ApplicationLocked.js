"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = require("./design/colors");
const grid_1 = require("./design/grid");
const delay_1 = require("./delay");
const utils_1 = require("./utils");
const async_storage_1 = require("@react-native-community/async-storage");
const d3_ease_1 = require("d3-ease");
const React = require("react");
const Animate_1 = require("react-move/Animate");
const react_native_1 = require("react-native");
const MaterialIcons_1 = require("react-native-vector-icons/MaterialIcons");
const thirdSize = react_native_1.Dimensions.get("window").width / 3 + 20;
const { height, width } = react_native_1.Dimensions.get("window");
class ApplicationLocked extends React.PureComponent {
    constructor(props) {
        super(props);
        this.renderButton = () => {
            return (React.createElement(react_native_1.TouchableOpacity, { onPress: () => {
                    if (this.props.onClickButton) {
                        this.props.onClickButton();
                    }
                    else {
                        throw 'Quit';
                    }
                }, style: styles.button },
                React.createElement(react_native_1.Text, { style: styles.closeButtonText }, "Exit the app")));
        };
        this.renderTimer = (minutes, seconds) => {
            return (React.createElement(react_native_1.View, { style: styles.viewTimer },
                React.createElement(react_native_1.Text, { style: styles.textTimer }, `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`)));
        };
        this.renderTitle = () => {
            return (React.createElement(react_native_1.Text, { style: styles.title }, 'Maximum attempts \nreached'));
        };
        this.renderIcon = () => {
            return (React.createElement(react_native_1.View, { style: styles.viewIcon },
                React.createElement(MaterialIcons_1.default, { name: 'lock-outline', size: 24, color: "rgb(75,94,127)" })));
        };
        this.renderErrorLocked = () => {
            const minutes = Math.floor(this.state.timeDiff / 1000 / 60);
            const seconds = Math.floor(this.state.timeDiff / 1000) % 60;
            return (React.createElement(react_native_1.View, null,
                React.createElement(Animate_1.default, { show: true, start: {
                        opacity: 0
                    }, enter: {
                        opacity: [1],
                        timing: { delay: 1000, duration: 1500, ease: d3_ease_1.easeLinear }
                    } }, (state) => (React.createElement(react_native_1.View, { style: [styles.viewTextLock, { opacity: state.opacity }] },
                    this.renderTitle(),
                    this.renderIcon(),
                    React.createElement(react_native_1.View, { style: {
                            justifyContent: 'center',
                            alignItems: "center",
                            flexDirection: "row",
                            marginBottom: 20,
                            flex: 1,
                        } },
                        React.createElement(react_native_1.View, null,
                            React.createElement(react_native_1.Text, { style: styles.text }, `3 incorrect passcodes have been entered. To protect your information, access has been locked for ${Math.ceil(this.props.timeToLock / 1000 / 60)} minutes.`))),
                    React.createElement(react_native_1.Text, { style: [styles.text, { marginBottom: 40 }] }, 'Come back later and try again.'),
                    this.renderTimer(minutes, seconds)))),
                React.createElement(Animate_1.default, { show: true, start: {
                        opacity: 0
                    }, enter: {
                        opacity: [1],
                        timing: { delay: 2000, duration: 1500, ease: d3_ease_1.easeLinear }
                    } }, (state) => (React.createElement(react_native_1.View, { style: { opacity: state.opacity, flex: 1 } },
                    React.createElement(react_native_1.View, { style: styles.viewCloseButton }, this.renderButton()))))));
        };
        this.state = {
            timeDiff: 0
        };
        this.isUnmounted = false;
        this.timeLocked = 0;
        this.timer = this.timer.bind(this);
        this.renderButton = this.renderButton.bind(this);
        this.renderTitle = this.renderTitle.bind(this);
    }
    componentDidMount() {
        async_storage_1.default.getItem(this.props.timePinLockedAsyncStorageName).then(val => {
            this.timeLocked = new Date(val ? val : '').getTime() + this.props.timeToLock;
            this.timer();
        });
    }
    async timer() {
        const timeDiff = +new Date(this.timeLocked) - +new Date();
        this.setState({ timeDiff: Math.max(0, timeDiff) });
        await delay_1.default(1000);
        if (timeDiff < 1000) {
            this.props.changeStatus(utils_1.PinResultStatus.initial);
            async_storage_1.default.multiRemove([
                this.props.timePinLockedAsyncStorageName,
                this.props.pinAttemptsAsyncStorageName
            ]);
        }
        if (!this.isUnmounted) {
            this.timer();
        }
    }
    componentWillUnmount() {
        this.isUnmounted = true;
    }
    render() {
        return (React.createElement(react_native_1.View, { style: this.props.styleMainContainer
                ? this.props.styleMainContainer
                : styles.container }, this.renderErrorLocked()));
    }
}
exports.default = ApplicationLocked;
const styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        backgroundColor: colors_1.colors.background,
        flexBasis: 0,
        left: 0,
        height,
        width,
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    text: {
        fontSize: grid_1.grid.unit,
        color: "#4B5E7F",
        lineHeight: grid_1.grid.unit * grid_1.grid.lineHeight,
        textAlign: 'center',
        fontFamily: 'Comfortaa-light'
    },
    viewTextLock: {
        marginTop: 2 * grid_1.grid.unit,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: grid_1.grid.unit * 3,
        paddingRight: grid_1.grid.unit * 3,
        flex: 3
    },
    textTimer: {
        fontFamily: 'Comfortaa-light',
        fontSize: 48,
        color: "#4B5E7F"
    },
    title: {
        fontSize: 24,
        color: colors_1.colors.base,
        textAlign: "center",
        fontFamily: 'Comfortaa-light',
        marginBottom: 20
    },
    viewIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    viewTimer: {
        paddingLeft: 30,
        paddingRight: 30,
        paddingBottom: 10,
        paddingTop: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: 'rgb(230, 231, 233)',
        marginBottom: grid_1.grid.unit * 4
    },
    viewCloseButton: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginTop: grid_1.grid.unit * 2,
        flex: 1,
    },
    button: {
        display: 'flex',
        height: 48,
        marginLeft: 2 * grid_1.grid.unit,
        marginRight: 2 * grid_1.grid.unit,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: '#01e576',
    },
    closeButtonText: {
        fontWeight: 'bold',
        fontFamily: 'Comfortaa',
        color: "#fff",
        fontSize: 16
    },
    borderViewRight: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: "flex-end",
        marginHorizontal: 10
    },
    borderViewLeft: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: "flex-start",
        marginHorizontal: 10
    },
    borderBottom: {
        backgroundColor: '#ccc',
        height: 2,
        width: 10,
    },
});
