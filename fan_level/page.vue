<template>
	<v-main>
		<v-row align="center" class="ma-0" style="height: 100vh;">
			<v-col offset="1" offset-sm="2" cols="10" sm="8" md="6" align="center">
				<v-row align="center">
					<h1 class="display-1 indigo--text">소피아 애청지수</h1>
					<v-col cols="4" align="end">
						<v-layout justify-end align-end>
							<v-btn tile depressed color="indigo" dark @click="save">저장하기</v-btn>
						</v-layout>
					</v-col>
				</v-row>
				<v-divider></v-divider>
				<!-- S: options.chatpoint -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						채팅 입력 점수
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-text-field v-model="options.chatpoint" color="indigo darken-1" type="number" suffix="점">
						</v-text-field>
					</v-col>
				</v-row>
				<!-- E: options.chatpoint -->
				<!-- S: options.likepoint -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						좋아요 점수
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-text-field v-model="options.likepoint" color="indigo darken-1" type="number" suffix="점">
						</v-text-field>
					</v-col>
				</v-row>
				<!-- E: options.likepoint -->
				<!-- S: options.attendpoint -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						출석 점수
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-text-field v-model="options.attendpoint" color="indigo darken-1" type="number" suffix="점">
						</v-text-field>
					</v-col>
				</v-row>
				<!-- E: options.attendpoint -->
				<!-- S: options.lottospoon -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						복권지급스푼
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-text-field v-model="options.lottospoon" color="indigo darken-1" type="number" suffix="스푼">
						</v-text-field>
					</v-col>
				</v-row>
				<!-- E: options.lottospoon -->
				<!-- S: options.lottodefaultpoint -->
				<v-row class="ma-0" align="center">
					<v-col :cols="leftCol" align="left" class="pa-0">
						복권기본점수
					</v-col>
					<v-col :cols="rightCol" align="right" class="pa-0">
						<v-text-field v-model="options.lottodefpoint" color="indigo darken-1" type="number" suffix="점">
						</v-text-field>
					</v-col>
				</v-row>
				<!-- E: options.lottodefaultpoint -->
				<!-- S: options.quiz -->
				<v-row align="center">
					<v-col cols="7" align="left">
						<v-row class="ma-0" align="left">
							<v-switch v-model="options.quiz_enable" color="indigo" inset class="ml-1" label="돌발퀴즈사용">
							</v-switch>
						</v-row>
					</v-col>
				</v-row>
				<!-- E: options.quiz -->
				<!-- S: Add item button -->
				<v-row v-if="options.quiz_enable === true" align="center" class="mt-2">
					<v-col cols="12" class="px-3">
						<v-btn block tile dark depressed color="indigo" @click="addNewItem">
							아이템 추가
						</v-btn>
					</v-col>
					<v-col cols="4" class="py-0">
						퀴즈 인터벌
					</v-col>
					<v-col cols="2" class="py-0">
						<v-text-field v-model="options.quiz_itv" color="indigo darken-1" type="number" suffix="분">
						</v-text-field>
					</v-col>
					<v-col cols="4" class="py-0">
						정답자 점수
					</v-col>
					<v-col cols="2" class="py-0">
						<v-text-field v-model="options.quiz_point" color="indigo darken-1" type="number" suffix="점">
						</v-text-field>
					</v-col>
				</v-row>
				<!-- E: Add item button -->
				<v-row v-if="options.quiz_enable === true" align="center" v-for="(item, idx) of list" :key="idx + '-' + item.question">
					<v-col cols="8" class="py-0">
						<v-text-field :value="item.question" @input="keyInput(this, $event, idx, 'question')" hide-details
							single-line></v-text-field>
					</v-col>
					<v-col cols="3" class="py-0">
						<v-text-field :value="item.answer" @input="keyInput(this, $event, idx, 'answer')"
							hide-details color="indigo darken-1" single-line>
						</v-text-field>
					</v-col>
					<v-col cols="1" class="py-0">
						<v-btn icon color="red darken-1" style="margin-top: 15px;" @click="deleteItem(idx)">
							<v-icon>mdi-delete</v-icon>
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</v-main>
</template>
<script>
const path = window.require('path');
const CfgLite = window.appCfg.__proto__.constructor;
const cfg = new CfgLite(path.join(__dirname, 'config.cfg'));
const fs = window.require('fs');
const copy = (obj) => JSON.parse(JSON.stringify(obj));

export default {
	data: () => ({
		leftCol: 7,
		rightCol: 5,
		options : cfg.get('options') || {
        chatpoint: 1,
        likepoint: 10,
        attendpoint: 10,
		lottospoon : 100,
		lottodefpoint : 10,
		quiz_enable: false,
		quiz_itv: 5,
		quiz_point: 50
    },
	list: cfg.get('list') || [],
	listCopy: [],
	}),
	async mounted() {
		this.listCopy = copy(this.list);
	},
	methods: {
		save() {
			this.listRefresh();
			
			cfg.set('options', this.options);
			cfg.set('list', this.list);
			cfg.save();
            if(this.options.quiz_enable === true && this.list.length === 0){
                this.$swal({
					icon: 'error',
					html: '돌발퀴즈를 사용할경우 문제를 등록해주세요.',
					title: '에러',
				});
				return;
            }
			this.$swal({
				icon: 'success',
				html: '저장에 성공했습니다.',
				position: 'top-end',
				timer: 3000,
				toast: true,
			});
			this.reload();
		},
		load() {
			this.options= cfg.get('options');
			this.boost_enable=cfg.get('boost_enable');
			this.reload();
		},
		addNewItem() {
			this.list.push({
				question: '',
				answer: '',
			});
			this.listRefresh();
		},
		keyInput(node, question, idx, key) {
			this.listCopy[idx][key] = question;
		},
		listRefresh() {
			const tmp = this.list;
			tmp.forEach((l, idx) => {
				if ( this.listCopy[idx] ) {
					l.question = this.listCopy[idx].question;
					l.answer = this.listCopy[idx].answer;
				}
			});
			this.listCopy = copy(tmp);
			this.list = tmp;
		},
		deleteItem(idx) {
			console.log('delete', idx, this.list);
			this.listCopy.splice(idx, 1);
			this.list = copy(this.listCopy);
		},
	},
}
</script>