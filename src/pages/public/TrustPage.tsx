"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Database } from "lucide-react";

export default function TrustPage() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-6">
            Trust & Privacy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trust isn't a feature — it's the foundation. Here's how we protect your privacy and earn your confidence.
          </p>
        </div>
      </section>

      {/* Core Principles */}
      <section className="px-5 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="grid gap-8">
            <div className="calm-card flex gap-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Your information stays private</h3>
                <p className="text-muted-foreground">
                  We don't share your personal information, mineral interests, or activity with third parties. Your data is yours alone.
                </p>
              </div>
            </div>

            <div className="calm-card flex gap-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">No ownership verification</h3>
                <p className="text-muted-foreground">
                  MineralView does not verify, claim to verify, or make representations about legal ownership of mineral interests. This is an informational tool only.
                </p>
              </div>
            </div>

            <div className="calm-card flex gap-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">We don't sell your data</h3>
                <p className="text-muted-foreground">
                  We will never sell, trade, or monetize your personal information or the mineral interests you monitor. Our business model is simple: you pay a subscription, we provide a service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Role */}
      <section className="px-5 md:px-8 py-16 md:py-20 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-10 text-center">
            Our role
          </h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              MineralView provides structured data and thoughtful interpretation so mineral owners can understand their assets with clarity and confidence.
            </p>
            <p>
              We are not a brokerage or marketplace, and we do not facilitate transactions between buyers and sellers.
            </p>
            <p>
              MineralView does not provide legal or tax advice. Decisions regarding your minerals should be made in consultation with qualified professionals.
            </p>
            <p>
              When value estimates or projections are presented, they are clearly labeled and based on available data and stated assumptions. They are analytical tools — not guarantees.
            </p>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="px-5 md:px-8 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-8 text-center">
            Our data sources
          </h2>
          <div className="calm-card">
            <p className="text-muted-foreground mb-6">
              MineralView aggregates information from public sources including:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">Texas Railroad Commission filings and permits</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">Public production reports</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">Completion records</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">Operator filings and disclosures</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              While we strive for accuracy, public data can contain errors or delays. Always verify important information through official channels.
            </p>
          </div>
        </div>
      </section>

      {/* You're in Control */}
      <section className="px-5 md:px-8 py-16 md:py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-6">
            You're in control
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Your preferences matter. You control how we communicate with you and what information you see.
          </p>
          <ul className="inline-block text-left space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">Turn email or push notifications on or off</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">Adjust your alert radius to control sensitivity</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">Choose simple or more detailed explanations</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">Delete your account and data at any time</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 md:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">
            Questions?
          </h2>
          <p className="text-muted-foreground mb-8">
            If you have questions about privacy or how we handle your data, we're happy to help.
          </p>
          <Link href="/app">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
