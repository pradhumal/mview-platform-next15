import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, MessageCircle, Settings } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: MapPin,
    title: "Add your minerals",
    description: "Enter your mineral interests by well, API number, or location. You can add as many as you need.",
  },
  {
    number: "2",
    icon: Bell,
    title: "We track changes for you",
    description: "MineralView watches public filings, permits, completions, and production reports across Texas. You don't have to check constantly — we do that work for you.",
  },
  {
    number: "3",
    icon: MessageCircle,
    title: "Understand what changed — and why it matters",
    description: "No jargon. No data dumps. Just clear explanations of what happened and whether it's significant — written for owners, not engineers.",
  },
  {
    number: "4",
    icon: Settings,
    title: "Control what you see",
    description: "Adjust your preferences, choose how much detail you want, and decide how often you hear from us. If nothing matters, you won't hear from us.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-6">
            How MineralView works
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We handle the tracking so you don't have to dig through filings, reports, or maps. Here's how it works.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-5 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-12">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Step {step.number}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What you can ask */}
      <section className="px-5 md:px-8 py-16 md:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-8 text-center">
            Questions you can ask
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            MineralView explains activity in plain English. Here are some common questions owners ask:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="calm-card">
              <p className="text-foreground">"What changed near me recently?"</p>
            </div>
            <div className="calm-card">
              <p className="text-foreground">"Why did my production change?"</p>
            </div>
            <div className="calm-card">
              <p className="text-foreground">"Is this decline normal?"</p>
            </div>
            <div className="calm-card">
              <p className="text-foreground">"Could there be more wells here?"</p>
            </div>
            <div className="calm-card">
              <p className="text-foreground">"Is new drilling planned nearby?"</p>
            </div>
            <div className="calm-card">
              <p className="text-foreground">"What usually happens next?"</p>
            </div>
          </div>
        </div>
      </section>

      {/* What you won't see */}
      <section className="px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 text-center">
            What you won't see
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            MineralView is built on a few principles:
          </p>
          <div className="space-y-5 text-foreground leading-relaxed">
            <p>
              <span className="font-medium">No hype or pressure.</span>{" "}
              We explain what's happening and show the evidence — you decide what to do.
            </p>
            <p>
              <span className="font-medium">No hidden agendas.</span>{" "}
              We don't sell your data or steer you toward transactions.
            </p>
            <p>
              <span className="font-medium">No black-box answers.</span>{" "}
              Important insights always link to the underlying chart, map, or report.
            </p>
            <p>
              <span className="font-medium">No false certainty.</span>{" "}
              We label assumptions, uncertainty, and data gaps clearly.
            </p>
            <p>
              <span className="font-medium">No unnecessary complexity.</span>{" "}
              The default experience is simple; advanced tools are available when needed.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 md:px-8 py-16 md:py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
            Ready to understand your minerals?
          </h2>
          <p className="text-muted-foreground mb-8">
            Add your first mineral interest and we'll help you make sense of it.
          </p>
          <Link to="/app">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
