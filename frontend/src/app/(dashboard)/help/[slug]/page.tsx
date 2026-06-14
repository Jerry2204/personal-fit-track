"use client"

import { useParams, notFound } from "next/navigation"
import { HelpLayout, HelpSection, HelpSteps, HelpTips } from "@/components/help/help-layout"
import { helpPagesBySlug } from "@/lib/help-content"

export default function HelpFeaturePage() {
  const params = useParams<{ slug: string }>()
  const page = helpPagesBySlug[params.slug]

  if (!page) {
    notFound()
  }

  return (
    <HelpLayout title={page.title} description={page.description}>
      {page.sections.map((section) => (
        <HelpSection key={section.title} title={section.title}>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {section.content}
            </p>
            {section.steps && section.steps.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Steps
                </p>
                <HelpSteps steps={section.steps} />
              </div>
            )}
            {section.tips && section.tips.length > 0 && (
              <HelpTips tips={section.tips} />
            )}
          </div>
        </HelpSection>
      ))}
    </HelpLayout>
  )
}
