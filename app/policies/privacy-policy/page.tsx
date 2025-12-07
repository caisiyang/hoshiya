export const metadata = {
    title: 'プライバシーポリシー',
    description: 'HOSHIYA Privacy Policy'
};

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-12 md:py-20 text-neutral-800">
            <h1 className="mb-10 font-serif text-3xl md:text-4xl text-center tracking-widest">プライバシーポリシー</h1>

            <div className="prose prose-neutral mx-auto bg-white p-8 md:p-12 shadow-sm border border-neutral-100">
                <p className="text-sm">HOSHIYA（以下，「当社」といいます。）は，本ウェブサイト上で提供するサービス（以下，「本サービス」といいます。）における，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。</p>

                <h3 className="font-bold mt-6 mb-2">第1条（個人情報）</h3>
                <p className="text-sm">「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及を指します。</p>

                <h3 className="font-bold mt-6 mb-2">第2条（個人情報の収集方法）</h3>
                <p className="text-sm">当社は，ユーザーが利用登録をする際に氏名，住所，電話番号，メールアドレス，クレジットカード番号などの個人情報をお尋ねすることがあります。</p>

                <h3 className="font-bold mt-6 mb-2">第3条（お問い合わせ窓口）</h3>
                <p className="text-sm">本ポリシーに関するお問い合わせは，下記の窓口までお願いいたします。</p>
                <p className="text-sm mt-4">
                    HOSHIYA Support Team<br />
                    E-mail: support@hoshiya.com
                </p>
            </div>
        </div>
    );
}
