import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const features = [
  "Understand unlimited mineral interests",
  "Know when activity matters",
  "Plain-language explanations",
  "Simple context maps",
  "Alerts only when something changes",
  "Adjustable notification preferences",
];

export default function PricingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One plan. Everything included. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="px-5 md:px-8 pb-16 md:pb-24">
        <div className="max-w-md mx-auto">
          <div className="calm-card border-primary/20">
            <div className="text-center mb-8">
              <h2 className="text-lg font-medium text-foreground mb-4">MineralView</h2>
              <div className="mb-2">
                <span className="text-5xl font-medium text-foreground">$15</span>
                <span className="text-muted-foreground text-lg"> / month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                or $150 / year (save $30)
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/app">
              <Button className="w-full" size="lg">
                Get started
              </Button>
            </Link>

            <p className="text-center text-sm text-muted-foreground mt-4">
              No contracts. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 md:px-8 py-16 md:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-12 text-center">
            Common questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="font-medium text-foreground mb-2">
                Is there a free trial?
              </h3>
              <p className="text-muted-foreground">
                We don't offer a traditional free trial, but you can cancel anytime within your first month for a full refund if MineralView isn't right for you.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">
                How many minerals can I track?
              </h3>
              <p className="text-muted-foreground">
                There's no limit. Add as many mineral interests as you need — wells, leases, or locations.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">
                What's included in the annual plan?
              </h3>
              <p className="text-muted-foreground">
                The annual plan includes everything in the monthly plan. You simply save $30 by paying upfront.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes. There are no contracts or cancellation fees. You can cancel from your settings at any time.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-2">
                Do you sell my data?
              </h3>
              <p className="text-muted-foreground">
                No. Your information stays private. We don't sell, share, or monetize your data in any way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
            Start understanding today
          </h2>
          <p className="text-muted-foreground mb-8">
            Know what changed. Know when it matters. No constant checking required.
          </p>
          <Link to="/app">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
