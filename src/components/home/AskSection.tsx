import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/Reveal";
import { useToast } from "@/hooks/use-toast";
import { Check, Send } from "lucide-react";

export const AskSection = () => {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSending(true);
    const { error } = await supabase.from("audience_questions").insert({
      name: name.trim() || null,
      question: question.trim(),
      status: "new",
    });
    setSending(false);

    if (error) {
      toast({ title: "تعذّر الإرسال", description: "حاول مرة أخرى بعد قليل", variant: "destructive" });
      return;
    }
    setSent(true);
    setName("");
    setQuestion("");
  };

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-6">
        <Reveal className="surface-alt rounded-[28px] p-7 md:p-12 grid lg:grid-cols-[1fr_1.1fr] gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl text-brand leading-snug">من سؤالك يبدأ المقال</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              اكتب السؤال الذي يشغلك، وقد يتحوّل إلى مقال قادم في المُنحنى.
            </p>
          </div>

          <div className="relative min-h-[230px]">
            <form
              onSubmit={submit}
              className={`space-y-4 transition-all duration-500 ${sent ? "opacity-0 pointer-events-none translate-y-2" : "opacity-100"}`}
            >
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم (اختياري)"
                maxLength={80}
              />
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="ما السؤال الذي تودّ أن نجيب عنه؟"
                rows={4}
                maxLength={600}
                required
              />
              <Button type="submit" disabled={sending} className="gap-2">
                <Send className="w-4 h-4" />
                {sending ? "جارٍ الإرسال..." : "أرسل سؤالك"}
              </Button>
            </form>

            <div
              aria-live="polite"
              className={`absolute inset-0 flex flex-col items-center justify-center text-center gap-3 transition-all duration-500 ${sent ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <span className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-7 h-7 text-brand" />
              </span>
              <p className="text-lg font-semibold text-brand">وصل سؤالك</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                شكرًا لك، سؤالك الآن ضمن أفكار المُنحنى القادمة.
              </p>
              <Button variant="ghost" onClick={() => setSent(false)}>أرسل سؤالًا آخر</Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AskSection;
