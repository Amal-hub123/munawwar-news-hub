import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check } from "lucide-react";

const EXAMPLES = ["كيف تغيّر الأرقام حياتنا اليومية؟", "ماذا يحدث خلف القرار الاقتصادي؟", "أين تبدأ حكاية الإنسان مع السوق؟"];
export const AskSection = () => {
  const [name, setName] = useState(""); const [question, setQuestion] = useState(""); const [sending, setSending] = useState(false); const [sent, setSent] = useState(false); const [example, setExample] = useState(0); const { toast } = useToast();
  useEffect(() => { if (question) return; const id = window.setInterval(() => setExample((value) => (value + 1) % EXAMPLES.length), 4200); return () => window.clearInterval(id); }, [question]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!question.trim()) return; setSending(true); const { error } = await supabase.from("audience_questions").insert({ name: name.trim() || null, question: question.trim(), status: "new" }); setSending(false); if (error) { toast({ title: "تعذّر الإرسال", description: "حاول مرة أخرى بعد قليل", variant: "destructive" }); return; } setSent(true); setName(""); setQuestion(""); };
  return (
    <section className="ask-editorial-section"><div className="ask-orbit" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-6"><Reveal variant="clip" className="ask-editorial-inner"><p className="editorial-kicker">دورك في الحكاية</p><h2>ما السؤال الذي يستحق<br />أن يصبح حكاية؟</h2><div className="ask-example" aria-live="polite"><span>مثلًا</span><p key={example}>{EXAMPLES[example]}</p></div>
        <div className="ask-form-stage">
          <form onSubmit={submit} className={sent ? "is-hidden" : ""}><Textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="اكتب سؤالك هنا..." rows={2} maxLength={600} required /><div className="ask-form-footer"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="اسمك (اختياري)" maxLength={80} /><Button type="submit" disabled={sending} className="ask-submit">{sending ? "جارٍ الإرسال..." : "أرسل السؤال"}<ArrowLeft /></Button></div></form>
          <div className={`ask-success ${sent ? "is-visible" : ""}`} aria-live="polite"><span><Check /></span><h3>وصل سؤالك</h3><p>أصبح الآن ضمن أفكار المُنحنى القادمة.</p><Button variant="ghost" onClick={() => setSent(false)}>أرسل سؤالًا آخر</Button></div>
        </div>
      </Reveal></div>
    </section>
  );
};
export default AskSection;