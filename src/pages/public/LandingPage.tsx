import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Eye, EyeOff, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mb-6 leading-tight">
            Understand what's happening with your minerals
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            We track public oil & gas activity and explain what it means — so you know what changed, why it matters, and when nothing needs action.
          </p>
          <p className="text-base text-muted-foreground mb-10 max-w-xl mx-auto">
            MineralView brings clarity to complex filings, production changes, and check stubs using plain-language explanation — while keeping the underlying data fully accessible if you want to explore further. No hype. No sales pressure. Just context.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/app">
              <Button size="lg" className="min-w-[180px]">
                Get started
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="min-w-[180px]">
                Learn how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why MineralView Exists */}
      <section className="px-5 md:px-8 py-16 md:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-8 text-center">
            Why MineralView exists
          </h2>
          <div className="space-y-6 text-muted-foreground text-lg">
            <p>
              Mineral ownership is complicated. Checks change. Filings appear. Production shifts — and it's hard to know if something is wrong.
            </p>
            <p className="font-medium text-foreground">
              Operators have teams watching every detail.<br />
              Most owners don't.
            </p>
            <p>
              MineralView gives owners the same level of oversight — and explains what they're seeing in plain language.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do / Don't Do */}
      <section className="px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* What we do */}
            <div className="calm-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-success" />
                </div>
                <h3 className="text-xl font-medium text-foreground">What we do</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">Explains changes near your minerals</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">Flags unexpected activity and puts it in context</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">Translates confusing terms and reports into plain English</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">Helps you know when something matters — and when it doesn't</span>
                </li>
              </ul>
            </div>

            {/* What we don't do */}
            <div className="calm-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium text-foreground">What we don't do</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">We don't buy minerals</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">We don't broker deals</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">We don't sell your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">We don't pressure you to act</span>
                </li>
              </ul>
              <p className="mt-6 text-sm text-foreground font-medium">
                MineralView is designed to inform, not persuade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Owners */}
      <section className="px-5 md:px-8 py-16 md:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
            Built for owners who want clarity
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            MineralView isn't a trading platform or a professional analytics tool. It's built for individuals, families, and heirs who feel overwhelmed by confusing check stubs and industry jargon — and want someone in their corner.
          </p>
        </div>
      </section>

      {/* Privacy & Trust */}
      <section className="px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-8 text-center">
            Privacy & trust
          </h2>
          <ul className="space-y-4 max-w-lg mx-auto">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">Your information stays private</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">You control alerts and preferences</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">MineralView does not verify legal ownership</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">MineralView does not sell or share owner data</span>
            </li>
          </ul>
          <p className="text-center mt-8 font-medium text-foreground text-lg">
            Trust isn't a feature — it's the foundation.
          </p>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-5 md:px-8 py-16 md:py-20 bg-muted/30">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-8">
            Simple pricing
          </h2>
          <div className="calm-card">
            <div className="mb-4">
              <span className="text-4xl font-medium text-foreground">$15</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              or $150 / year (save $30)
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              No contracts. Cancel anytime.
            </p>
            <Link to="/app">
              <Button className="w-full">Get started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
            Clarity without the complexity
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Track what's happening with your minerals — with context when you need it.
          </p>
          <Link to="/app">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
