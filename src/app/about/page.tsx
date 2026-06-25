import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "このブログについて",
  description:
    "まくろなねこNOTEは、エクセルマクロ・Google Apps Script・AppSheet・Dify・生成AIなどを活用した業務効率化×DX情報メディアです。",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
        このブログについて
      </h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-8 text-center">
        <div className="w-24 h-24 mx-auto mb-5 rounded-full overflow-hidden relative">
          <Image
            src="/くろねこ写真01.jpg"
            alt="にこにこねこ"
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
        <h2 className="font-bold text-gray-900 text-lg mb-1">にこにこねこ</h2>
        <p className="text-sm text-gray-500">総務・人事歴20年以上</p>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          ブログのコンセプト
        </h2>
        <p className="text-gray-700 leading-relaxed">
          「まくろなねこNOTE」は、総務・人事担当者のための業務×DX情報メディアです。
          日々の業務の中で感じる「もっと効率化できないか」「このツールは本当に使えるのか」といった疑問に、
          現場目線でお答えします。エクセルマクロ、Google Apps Script、AppSheet、Difyといったツールや生成AIを活用しながら、
          バックオフィス業務を効率化するノウハウを、実体験を交えながら発信していきます。
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          DXというと、ツールを導入してサブスクリプション費用がかかり続けるのに、なかなか効果が出せない……というケースも少なくありません。
          当ブログでは「お金をかけない」ことも大切なコンセプトにしています。無料・低コストで使えるツールや仕組みを中心に、
          費用を限りなくゼロに抑えながらしっかり効果を出す方法をお伝えしていきます。
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          著者プロフィール
        </h2>
        <p className="text-gray-700 leading-relaxed">
          にこにこねこ。総務・人事歴20年以上。事業会社にて人事労務・総務業務に幅広く携わり、
          バックオフィス業務の効率化やDXツールの導入支援を行ってきました。
          このブログでは、現場で本当に使える業務効率化の知見を発信しています。
        </p>
      </section>
    </div>
  );
}
