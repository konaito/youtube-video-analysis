import { AnalysisResult, AnalysisStep } from './types'

// サンプル動画のタイムライン分析データ
export const mockAnalysisData: AnalysisResult = {
  videoId: 'dQw4w9WgXcQ',
  title: '23歳幼なじみ夫婦のリアルで飾らない日曜日のルーティン',
  timeline: [
    {
      id: '1',
      startTime: 0,
      endTime: 4,
      scene: '起床',
      icon: '🛏️',
      onScreenTexts: [
        { time: '00:00', text: '23歳幼なじみ夫婦の日曜日' },
        { time: '00:00', text: '10:15 起床' },
      ],
      analysis: {
        intent: 'リアルな寝起きを見せることで親近感を演出。「起きない」→「起こす」という夫婦のじゃれあいで仲の良さを提示。',
        category: '導入',
      },
    },
    {
      id: '2',
      startTime: 5,
      endTime: 10,
      scene: '家事（炊飯）',
      icon: '🍚',
      onScreenTexts: [
        { time: '10:21', text: 'お米を炊く' },
      ],
      analysis: {
        intent: '【ASMR・生活音】水の音や炊飯器のスイッチ音を強調し、リズムを作る。手元のアップで作業の臨場感を出す。',
        category: 'ASMR・生活音',
      },
    },
    {
      id: '3',
      startTime: 11,
      endTime: 20,
      scene: '掃除',
      icon: '🧹',
      onScreenTexts: [
        { time: '10:55', text: 'お掃除' },
        { time: '10:59', text: 'ちょっかい' },
      ],
      analysis: {
        intent: 'ただの掃除風景にしない。掃除中にふざけ合う「ノリ」を入れることで、"幼なじみ夫婦"らしさを強調。オチ（コロコロで反撃）をつける。',
        category: '関係性',
      },
    },
    {
      id: '4',
      startTime: 21,
      endTime: 29,
      scene: '料理（昼）',
      icon: '🍳',
      onScreenTexts: [
        { time: '11:30', text: '完成' },
        { time: '11:35', text: '一緒に作る' },
      ],
      analysis: {
        intent: '「食ってるやん」「食ってません」という漫才のような掛け合い。背中合わせや横並びの構図で「協力して生きている感」を出す。',
        category: '会話',
      },
    },
    {
      id: '5',
      startTime: 30,
      endTime: 37,
      scene: '昼食',
      icon: '🍽️',
      onScreenTexts: [
        { time: '12:00', text: 'やっと食べる' },
        { time: '12:42', text: 'ごちそうさまでした' },
      ],
      analysis: {
        intent: 'ハイタッチや独自の「ごちそうさまポーズ」など、二人だけの定番ムーブを入れることでキャラクターを立たせる。早送りでテンポアップ。',
        category: '儀式・定型',
      },
    },
    {
      id: '6',
      startTime: 38,
      endTime: 41,
      scene: '外出（洗車）',
      icon: '🚗',
      onScreenTexts: [
        { time: '14:29', text: '洗車' },
      ],
      analysis: {
        intent: '家の中だけでなく外のシーンを挟み、画面に変化をつける。窓ガラスを利用した鏡越しショットはおしゃれな定番テクニック。',
        category: '場面転換',
      },
    },
    {
      id: '7',
      startTime: 42,
      endTime: 66,
      scene: '遊び（ガチャガチャ）',
      icon: '🎰',
      onScreenTexts: [
        { time: '15:05', text: '欲しいガチャガチャ回す' },
        { time: '15:10', text: 'まさかの神引き' },
        { time: '15:20', text: 'たまごっちの一番くじも引いた' },
      ],
      analysis: {
        intent: '具体的なキャラクター（タコピー、たまごっち）を出すことで、同世代の共感を得る。「何が出るか？」というワクワク感を共有。',
        category: '趣味・共感',
      },
    },
    {
      id: '8',
      startTime: 108,
      endTime: 113,
      scene: '帰宅・開封',
      icon: '📦',
      onScreenTexts: [
        { time: '18:54', text: '宅配届いた！' },
        { time: '18:55', text: 'にやにやしとる奴発見' },
      ],
      analysis: {
        intent: '夫の無邪気な様子を妻視点（第三者視点）で撮ることで、微笑ましさを演出。',
        category: '関係性',
      },
    },
    {
      id: '9',
      startTime: 114,
      endTime: 116,
      scene: '作業（編集）',
      icon: '✂️',
      onScreenTexts: [
        { time: '19:20', text: '編集' },
      ],
      analysis: {
        intent: 'YouTuberとしての活動風景を少し見せることで、「頑張っている」側面もアピール。',
        category: '裏側',
      },
    },
    {
      id: '10',
      startTime: 117,
      endTime: 119,
      scene: '仮眠',
      icon: '😴',
      onScreenTexts: [
        { time: '19:32', text: '爆睡' },
      ],
      analysis: {
        intent: '無防備な寝顔を入れる。リラックスした雰囲気を伝える。',
        category: '日常感',
      },
    },
    {
      id: '11',
      startTime: 120,
      endTime: 131,
      scene: '夕食',
      icon: '🍖',
      onScreenTexts: [
        { time: '20:00', text: '罪悪感を感じ料理し始める' },
        { time: '21:00', text: '褒める' },
        { time: '21:24', text: 'ごちそうさまでした' },
      ],
      analysis: {
        intent: '料理のアップでおいしそうに見せる。「激ウマ」と褒めることで、作った側（妻）も見た側も幸せな気分にさせる。',
        category: 'シズル感・肯定',
      },
    },
    {
      id: '12',
      startTime: 132,
      endTime: 137,
      scene: 'デザート',
      icon: '🍰',
      onScreenTexts: [
        { time: '21:26', text: '抹茶バウムクーヘン' },
      ],
      analysis: {
        intent: '些細な失敗（紐が解けないなど）をそのまま使い、完璧すぎない可愛さを出す。夫の笑顔で締める。',
        category: 'ハプニング',
      },
    },
    {
      id: '13',
      startTime: 138,
      endTime: 139,
      scene: 'リラックス',
      icon: '📺',
      onScreenTexts: [
        { time: '22:01', text: '最近ハマってるドラマ見る' },
      ],
      analysis: {
        intent: 'ソファでくつろぐ引きの画角。生活の一部を切り取る。',
        category: '日常感',
      },
    },
    {
      id: '14',
      startTime: 140,
      endTime: 143,
      scene: '就寝',
      icon: '🌙',
      onScreenTexts: [
        { time: '23:30', text: 'おやすみ' },
      ],
      analysis: {
        intent: '勢いよくベッドに入り、暗転。一日の終わりを明確にして動画を締める。',
        category: 'エンディング',
      },
    },
  ],
  guidePoints: [
    {
      id: 1,
      title: '「時間」と「行動」をテキストで可視化する',
      icon: '1️⃣',
      description: 'この動画の最大の特徴は、画面中央や端に必ず「時刻」と「何をしているか」のテキストが入っていることです。',
      details: '視聴者が「今は朝なんだな」「もう夜か」と時間の流れを直感的に理解でき、長尺の1日を短く感じさせます。',
      examples: [
        'フォントはシンプルで読みやすいものを選ぶ',
        '映像の邪魔にならない位置に配置する',
      ],
    },
    {
      id: 2,
      title: '「固定カメラ」と「手持ちカメラ」を使い分ける',
      icon: '2️⃣',
      description: '固定（三脚など）と手持ち（自撮り・相手撮り）をシーンごとに使い分けることが重要です。',
      details: '固定カメラ: 掃除、食事、就寝など、二人の全身や部屋の雰囲気を映すときに使用。客観的な視点になります。手持ちカメラ: 料理の手元、ガチャガチャの開封、寝顔など、臨場感や親密さを出したいときに使用。',
      examples: [
        'ずっと同じ画角だと飽きられるので、シーンごとにカメラの距離や位置を変える',
        '固定と手持ちを適切に組み合わせる',
      ],
    },
    {
      id: 3,
      title: '「完璧」よりも「ハプニング」や「ノリ」を大事にする',
      icon: '3️⃣',
      description: 'おしゃれな映像美よりも、「二人の関係性」がコンテンツの核です。',
      details: '掃除中にふざけ合うシーン、箱が開けられないポンコツなシーン、変なポーズでの「ごちそうさま」、ちょっとした言い合い。これらをカットせずに残すことで、「作られた映像」ではなく「リアルな二人の記録」として視聴者に愛着を持ってもらえます。',
      examples: [
        '完璧すぎない可愛さを出す',
        'ハプニングをそのまま使う',
        'ノリの良いシーンを残す',
      ],
    },
  ],
}

// 解析待機画面用のステップデータ
export const mockAnalysisSteps: AnalysisStep[] = [
  { id: '1', label: 'シーンの切り替わりを検出中...', status: 'completed' },
  { id: '2', label: '画面内のテキストを読み取り中...', status: 'completed' },
  { id: '3', label: '演出意図をAIが推測中...', status: 'processing' },
]
