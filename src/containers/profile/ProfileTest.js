import React, { Component } from 'react'
import {
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
} from 'react-native'
import { connect } from 'react-redux'
import Echarts from 'native-echarts'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { Actions } from 'react-native-router-flux'

import TextPingFang from '../../components/TextPingFang'
import Container from '../../components/Container'
import ProfileHeader from './components/ProfileHeader'

import {
	WIDTH,
	getResponsiveWidth,
} from '../../common/styles'

import HttpUtils from '../../network/HttpUtils'
import { USERS } from '../../network/Urls'
import questions from '../../constants/questions'
import { SCENE_NEW_DIARY } from '../../constants/scene'

function mapStateToProps(state) {
	return {
		user: state.user,
		partner: state.partner
	}
}

@connect(mapStateToProps)
export default class ProfileReward extends Component {

	state = {
		question: '欢迎来到我们的性格测试环节，这里有 15道题目，可以测出你的性格特征哦',
		answers: ['', ''],
		questionIndex: 0,
		content: [],
		isStart: true,
		isEnd: false,
		textBtn: '开始测试',
		componentTestResult: null
	}

	async componentDidMount() {
		if (this.props.user.emotions_basis) {
			this.setState({
				question: '你已经做过测试啦，确定要重新再做一次吗？',
				textBtn: '重新测试'
			})
		}
	}

	async _select(answer) {
		let { questionIndex, content, isStart, isEnd, textBtn } = this.state

		if (isStart) {
			this.setState({
				isStart: false,
				question: questions[questionIndex].question,
				answers: questions[questionIndex].answers,
				questionIndex: questionIndex + 1
			})
		}

		if (!isEnd && questionIndex < questions.length) {
			answer && content.push(answer)
			this.setState({
				question: questions[questionIndex].question,
				answers: questions[questionIndex].answers,
				questionIndex: questionIndex + 1,
				content
			})
		}

		if (questionIndex === questions.length && !isEnd) {
			answer && content.push(answer)
			this.setState({
				isEnd: true,
				textBtn: '去写一篇日记',
				content
			})

			const res = await HttpUtils.post(USERS.calculate_emotion, { content: content.join(',') })
			if (res.code === 0) {
				// e 喜悦 c 厌恶 o 低落 n 愤怒
				let data = res.data.emotions.split(',').map(item => parseFloat(item))
				let e = data[0],
						c = data[1],
						o = data[2],
						n = data[3]
				this._renderTestResult([e, o, c, n])
			}
		}

		if (isEnd) {
			Actions.jump(SCENE_NEW_DIARY)
		}
	}

	_renderTestResult(data) {
		const option = {
			radar: {
				shape: 'circle',
				name: {
					color: '#333',
					fontSize: 14,
					backgroundColor: 'red'
				},
				indicator: [
					{ name: '喜悦', max: 2 },
					{ name: '低落', max: 2 },
					{ name: '厌恶', max: 2 },
					{ name: '愤怒', max: 2 },
				]
			},
			series: [{
				name: '测试结果',
				type: 'radar',
				data: [
					{
						value: data
					}
				],
				areaStyle: {
					normal: {
						opacity: 0.1,
						color: 'rgba(45, 195, 166, 1)'
					},
				},
				lineStyle: {
					normal: {
						color: 'rgba(45, 195, 166, 1)'
					},
				},
				itemStyle: {
					normal: {
						color: 'rgba(45, 195, 166, 1)',
					}
				},
			}]
		};

		let componentTestResult = (
			<View style={styles.result_container}>
				<View style={styles.radar_container}>
					<Echarts option={option} height={getResponsiveWidth(240)} />
					<TextPingFang style={styles.text_title}>• 四维情绪雷达图</TextPingFang>
				</View>
				<TextPingFang style={styles.text_result}>性格测试完成啦，但为了让结果更准确，你还需要多写几篇真情流露的日记呢</TextPingFang>
			</View>
		)

		this.setState({ componentTestResult })
	}

	render() {
		return (
			<Container>
				<ProfileHeader
					title='性格测试'
					headerStyle={styles.header_style}
				/>

				{this.state.componentTestResult}

				<View style={[styles.question_container, { display: this.state.isEnd ? 'none' : 'flex' }]}>
					<Image style={styles.img_quote} source={require('../../../res/images/profile/icon_common_quote.png')} />
					<TextPingFang style={styles.text_question}>{this.state.question}</TextPingFang>
					<View style={styles.idx_container}>
						<TextPingFang style={[styles.text_idx_left, { display: this.state.questionIndex ? 'flex' : 'none' }]}>{this.state.questionIndex}</TextPingFang>
						<TextPingFang style={[styles.text_idx_right, { display: this.state.questionIndex ? 'flex' : 'none' }]}>{`/${questions.length}`}</TextPingFang>
					</View>
				</View>

				<View style={[styles.btns_container, { justifyContent: !this.state.isEnd && !this.state.isStart ? 'space-between' : 'flex-end' }]}>
					<TouchableOpacity
						style={[styles.btn, { display: this.state.isStart || this.state.isEnd ? 'flex' : 'none' }]}
						onPress={() => this._select()}
						activeOpacity={1}
					>
						<TextPingFang style={[styles.text_btn, styles.color_theme]}>{this.state.textBtn}</TextPingFang>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.btn, { display: !this.state.isEnd && !this.state.isStart ? 'flex' : 'none' }]}
						onPress={() => this._select(1)}
						activeOpacity={1}
					>
						<TextPingFang style={styles.text_answer}>{this.state.answers[0]}</TextPingFang>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.btn, { display: !this.state.isEnd && !this.state.isStart ? 'flex' : 'none' }]}
						onPress={() => this._select(2)}
						activeOpacity={1}
					>
						<TextPingFang style={styles.text_answer}>{this.state.answers[1]}</TextPingFang>
					</TouchableOpacity>
				</View>


			</Container>
		)
	}
}

const styles = StyleSheet.create({
	header_style: {
		paddingBottom: 0,
	},
	result_container: {
		width: WIDTH - getResponsiveWidth(48),
		alignItems: 'center'
	},
	radar_container: {
		width: '100%',
		alignItems: 'center'
	},
	text_title: {
		color: '#aaa',
		fontSize: 12,
		fontWeight: '400',
		marginTop: getResponsiveWidth(8)
	},
	text_result: {
		paddingLeft: getResponsiveWidth(24),
		paddingRight: getResponsiveWidth(24),
		marginTop: getResponsiveWidth(48),
		color: '#333',
		fontSize: 16,
		fontWeight: '400',
		textAlign: 'center'
	},
	question_container: {
		width: WIDTH - getResponsiveWidth(48),
		height: getResponsiveWidth(360),
		alignItems: 'center',
		borderRadius: 24,
		backgroundColor: '#2DC3A6'
	},
	img_quote: {
		marginTop: getResponsiveWidth(70)
	},
	text_question: {
		width: '100%',
		paddingLeft: getResponsiveWidth(24),
		paddingRight: getResponsiveWidth(24),
		marginTop: getResponsiveWidth(42),
		color: '#fff',
		textAlign: 'center',
		fontSize: 20,
		fontWeight: '500'
	},
	idx_container: {
		position: 'absolute',
		bottom: getResponsiveWidth(48),
		flexDirection: 'row'
	},
	text_idx_left: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold'
	},
	text_idx_right: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '300'
	},
	btns_container: {
		position: 'absolute',
		...ifIphoneX({
			bottom: 58
		}, {
			bottom: 24
		}),
		height: getResponsiveWidth(120)
	},
	btn: {
		width: WIDTH - getResponsiveWidth(48),
		height: getResponsiveWidth(52),
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 8,
		backgroundColor: '#f5f5f5'
	},
	text_btn: {
		color: '#2DC3A6',
		textAlign: 'center',
		fontSize: 14,
		fontWeight: '500'
	},
	text_answer: {
		color: '#333',
		textAlign: 'center',
		fontSize: 14,
	}
})
