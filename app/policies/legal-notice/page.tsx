export const metadata = {
    title: '特定商取引法に基づく表記',
    description: '特定商取引法に基づく表記 (Legal Notice)'
};

export default function LegalNoticePage() {
    return (
        <div className="mx-auto max-w-3xl px-6 py-12 md:py-20 text-neutral-800">
            <h1 className="mb-10 font-serif text-3xl md:text-4xl text-center tracking-widest">特定商取引法に基づく表記</h1>

            <div className="bg-white p-8 md:p-12 shadow-sm border border-neutral-100 space-y-8 text-sm leading-relaxed">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                    <div className="font-bold text-neutral-500">販売業者</div>
                    <div className="md:col-span-2">HOSHIYA Inc. (示例)</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                    <div className="font-bold text-neutral-500">運営統括責任者名</div>
                    <div className="md:col-span-2">山田 太郎 (示例)</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                    <div className="font-bold text-neutral-500">郵便番号</div>
                    <div className="md:col-span-2">〒107-0062</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                    <div className="font-bold text-neutral-500">住所</div>
                    <div className="md:col-span-2">東京都港区南青山 (示例地址)</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                    <div className="font-bold text-neutral-500">商品代金以外の料金の説明</div>
                    <div className="md:col-span-2">
                        <p>・消費税 (10%)</p>
                        <p>・配送料 (全国一律 800円、30,000円以上で無料)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                    <div className="font-bold text-neutral-500">申込有効期限</div>
                    <div className="md:col-span-2">ご注文後7日以内といたします。ご注文後7日間ご入金がない場合は、購入の意思がないものとし、注文を自動的にキャンセルとさせていただきます。</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                    <div className="font-bold text-neutral-500">引渡し時期</div>
                    <div className="md:col-span-2">ご注文を受けてから7日以内に発送いたします。</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-neutral-100 pb-6">
                    <div className="font-bold text-neutral-500">お支払い方法</div>
                    <div className="md:col-span-2">クレジットカード (VISA, Mastercard, Amex, JCB)</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                    <div className="font-bold text-neutral-500">電話番号</div>
                    <div className="md:col-span-2">03-1234-5678 (示例) <br /><span className="text-xs text-neutral-400">※お問い合わせはメールにてお願いいたします。</span></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
                    <div className="font-bold text-neutral-500">公開メールアドレス</div>
                    <div className="md:col-span-2">support@hoshiya.com</div>
                </div>

            </div>
        </div>
    );
}
