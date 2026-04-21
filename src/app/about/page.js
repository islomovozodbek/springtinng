import Link from "next/link";
import PageShapes from "@/components/PageShapes";

export const metadata = {
  title: "About — KeyboardSprint",
  description: "Learn about KeyboardSprint — a 3-minute creative writing game that trains your creativity, not your productivity.",
};

export default function AboutPage() {
  return (
    <div style={{ padding: "var(--space-3xl) 0", minHeight: "calc(100vh - var(--nav-height))", position: "relative", overflow: "hidden" }}>
      <PageShapes page="about" />
      




      <div className="container" style={{ maxWidth: "700px" }}>
        <div className="text-center" style={{ marginBottom: "var(--space-3xl)" }}>
          <h1 style={{ marginBottom: "var(--space-md)" }}>About KeyboardSprint</h1>
          <p className="text-lg">
            3-minute creative sprints to train your brain, not your productivity.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2xl)" }}>
          <section>
            <h2 style={{ marginBottom: "var(--space-md)" }}>What is this?</h2>
            <p>
              KeyboardSprint is a creative writing game. You get a random, weird starter sentence. 
              You have 3 minutes to continue it. If you stop typing for 5 seconds, your text starts 
              to vanish — permanently. After time ends, your story goes into a public feed where 
              others can vote on it, read it, and even continue your story.
            </p>
          </section>

          <section>
            <h2 style={{ marginBottom: "var(--space-md)" }}>Why?</h2>
            <p>
              We believe creativity is a muscle. Most writing tools focus on output — word counts, 
              deadlines, productivity metrics. We focus on the opposite: the raw act of thinking 
              and writing under pressure, without overthinking, without editing, without looking back.
            </p>
            <p style={{ marginTop: "var(--space-md)" }}>
              The vanish mechanic isn&apos;t punishment — it&apos;s liberation. When you know your words 
              might disappear, you stop trying to write something perfect and start writing something real.
            </p>
          </section>

          <section>
            <h2 style={{ marginBottom: "var(--space-md)" }}>How it helps</h2>
            <div style={{ display: "grid", gap: "var(--space-md)" }}>
              <div className="card">
                <h4>🧠 Forced Creativity</h4>
                <p style={{ marginTop: "var(--space-sm)" }}>
                  Random prompts + time pressure = no overthinking. Your subconscious does the heavy lifting.
                </p>
              </div>
              <div className="card">
                <h4>📖 Exposure to Others</h4>
                <p style={{ marginTop: "var(--space-sm)" }}>
                  Reading other people&apos;s 3-minute stories sparks ideas you&apos;d never have on your own.
                </p>
              </div>
              <div className="card">
                <h4>🗳️ Feedback via Voting</h4>
                <p style={{ marginTop: "var(--space-sm)" }}>
                  &quot;People liked this style&quot; → subconscious learning. No harsh critique, just vibes.
                </p>
              </div>
              <div className="card">
                <h4>🔗 Story Chains</h4>
                <p style={{ marginTop: "var(--space-sm)" }}>
                  Continue someone else&apos;s story. Collaborative storytelling creates unexpected magic.
                </p>
              </div>
            </div>
          </section>

          <section className="text-center" style={{ padding: "var(--space-2xl) 0" }}>
            <h2 style={{ marginBottom: "var(--space-md)" }}>Ready?</h2>
            <p style={{ marginBottom: "var(--space-xl)" }}>
              Your first sprint is free. No credit card needed.
            </p>
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Writing
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
