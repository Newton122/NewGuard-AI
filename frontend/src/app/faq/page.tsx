'use client'

import { useState } from 'react'
import { Shield, Search, FileText, Globe, Zap } from 'lucide-react'

const faqs = [
  {
    question: "How does NewsGuard AI detect fake news?",
    answer: "NewsGuard AI uses a multi-signal approach combining BERT deep learning models, linguistic heuristic analysis, and source credibility scoring. The BERT model analyzes language patterns and context, while heuristics flag suspicious writing styles like excessive capitalization, emotional language, and known misinformation phrases.",
    icon: Shield
  },
  {
    question: "What is the accuracy of the detection model?",
    answer: "The BERT model is trained on a large dataset of real and fake news articles. While no system is 100% accurate, our multi-signal approach (BERT + heuristics + source check) provides robust detection. The confidence score shown in results indicates the model's certainty level.",
    icon: Search
  },
  {
    question: "Can I analyze articles from any website?",
    answer: "Yes! You can paste article text directly, or provide a URL and our system will automatically scrape the content. The scraper extracts the main article text while removing navigation, ads, and other non-essential content.",
    icon: FileText
  },
  {
    question: "Is my data stored or shared?",
    answer: "Analysis history is stored locally in our database to provide the history feature and improve the service. We do not share your data with third parties. You can view your analysis history at any time.",
    icon: Globe
  },
  {
    question: "How does the related articles feature work?",
    answer: "When you analyze an article, the system searches for related coverage from trusted news sources. This cross-referencing helps verify claims by comparing them against reporting from multiple credible outlets.",
    icon: Search
  },
  {
    question: "What do the different risk levels mean?",
    answer: "Low risk means the article appears to be authentic with high confidence. Medium risk indicates some suspicious elements were found - verify with additional sources. High risk means multiple red flags were detected and the article is likely fake or misleading.",
    icon: Shield
  },
  {
    question: "Can I download analysis reports?",
    answer: "Yes! After analyzing an article, you can download a comprehensive PDF report containing the prediction, confidence score, key terms, explanations, and other analysis details.",
    icon: FileText
  },
  {
    question: "What is the browser extension?",
    answer: "The NewsGuard AI browser extension automatically detects and analyzes articles on social media and news websites. It injects credibility badges below articles in real-time as you browse, helping you identify potential misinformation instantly.",
    icon: Zap
  }
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#06060a] text-slate-100 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-30">
        <div className="absolute inset-0 bg-gradient-to-br from-[#06060a] via-[#0c0a14] to-[#0a0a0f]" />
      </div>

      <div className="relative z-10">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mb-16 text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-slate-400">Everything you need to know about NewsGuard AI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const Icon = faq.icon
              const isOpen = openIndex === idx
              return (
                <div key={idx} className="rounded-2xl glass overflow-hidden transition-all duration-300 hover:border-emerald-500/20">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center gap-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{faq.question}</h3>
                    </div>
                    <svg
                      className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pl-20">
                      <p className="text-sm leading-relaxed text-slate-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}