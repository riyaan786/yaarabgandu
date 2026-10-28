import type { Metadata } from "next";
import EvidenceGallery from "@/components/EvidenceGallery";
import Gallery from "@/components/Gallery";
import CorrectionForm from "@/components/CorrectionForm";
import {
  formatDate,
  formatRupee,
  getAuthorityLogs,
  getPricingEntries,
  getPublishedImages,
  getReviewTimeline,
  getVisitRecord,
} from "@/lib/content";
import { SITE, getSiteUrl } from "@/lib/config";
import type { VisitRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: SITE.seoTitle,
  description: SITE.description,
  alternates: { canonical: SITE.homePath },
  openGraph: {
    type: "article",
    locale: "en_IN",
    title: SITE.seoTitle,
    description: SITE.description,
    url: SITE.homePath,
  },
};

function VisitRecordCard({ record, label }: { record: VisitRecord; label: string }) {
  const hasData =
    record.visit_date ||
    record.visit_time ||
    record.service ||
    record.amount_paid ||
    record.description;
  if (!hasData) return null;

  const rows: [string, string][] = [
    ["Date of visit", record.visit_date ? formatDate(record.visit_date) : ""],
    ["Approximate time", record.visit_time],
    ["Service / product", record.service],
    ["Amount paid", record.amount_paid],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="card mt-6 p-5">
      <h3 className="eyebrow mt-0">{label}</h3>
      <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {k}
            </dt>
            <dd className="text-[0.97rem] text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {record.description && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Description of what happened
          </p>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-ink">
            {record.description}
          </p>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const images = getPublishedImages();
  const pricing = getPricingEntries();
  const authority = getAuthorityLogs();
  const reviews = getReviewTimeline();
  const serviceRecord = getVisitRecord("customer_service");
  const languageRecord = getVisitRecord("staff_language");

  const imagesById = new Map(images.map((img) => [img.id, img]));
  const evidence = images.filter((i) => i.category !== "reviews");
  const screenshotImages = images.filter((i) => i.category === "reviews");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SITE.seoTitle,
    description: SITE.description,
    url: `${getSiteUrl()}${SITE.homePath}`,
    inLanguage: "en-IN",
    about: {
      "@type": "AutomotiveBusiness",
      name: SITE.businessName,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Fraser Town, Bangalore (Bengaluru)",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
    },
    author: { "@type": "Person", name: "A customer of the business" },
    significantLink: `${getSiteUrl()}${SITE.homePath}#evidence`,
  };

  return (
    <div className="article mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <p className="eyebrow">Consumer warning — documentation of my experience</p>
      <h1 className="mt-3">
        {SITE.businessName} — My Experience in Fraser Town, Bangalore
      </h1>
      <blockquote className="quote-block mt-6">
        I went to {SITE.businessName} in Fraser Town, Bangalore as a paying
        customer. I was treated rudely, I heard staff use abusive language in
        front of customers, I was charged more than I considered fair, I noticed
        a suspicious burst of five-star reviews appearing at once, and I found
        the footpath outside blocked by the shop&apos;s stock and parked vehicles.
        This page documents what happened, with the evidence I have gathered.
      </blockquote>
      <div className="callout mt-6">
        <strong>Important legal notice.</strong> Everything on this page is my
        personal account, opinion and recollection — not a statement of
        established legal fact. I am not accusing anyone of a crime, and nothing
        here should be read as a legal finding that any law or rule was broken.
        Readers should review the supporting evidence and reach their own
        conclusion.
      </div>

        <EvidenceGallery />

      <nav aria-label="On this page" className="card mt-8 p-5">
        <h2 className="eyebrow mt-0">On this page</h2>
        <ol className="mt-3 grid gap-1 sm:grid-cols-2">
          {[
            ["#customer-service", "My experience with customer service"],
            ["#staff-language", "Language and behaviour in front of customers"],
            ["#pricing", "Concerns about pricing"],
            ["#reviews", "A sudden increase in positive reviews"],
            ["#footpath", "Footpath encroachment and pedestrian safety"],
            ["#why", "Why I created this website"],
            ["#evidence", "Photos & supporting evidence"],
            ["#contact", "Contact / corrections"],
          ].map(([href, label], i) => (
            <li key={href} className="text-[0.95rem]">
              <a href={href} className="font-medium">
                {i + 1}. {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── Section 1 ────────────────────────────────────────── */}
      <section id="customer-service" className="mt-14 scroll-mt-20">
        <h2 className="mt-0">My Experience With Customer Service</h2>
        <p>
          I walked into {SITE.businessName} in Fraser Town, Bangalore as a paying
          customer expecting basic courtesy. Instead, I was treated rudely. The
          staff spoke to me in a way that made me feel unwelcome and
          uncomfortable. A simple transaction turned into an unpleasant
          encounter because of the manner in which I was addressed.
        </p>
        <p>
          Customers who spend their money at a business are entitled to courteous
          communication. Being polite costs nothing. What I experienced was not
          a technical disagreement — it was rude, disrespectful treatment from
          people who were taking my money.
        </p>
        <p>
          This is my account of what happened to me. I am not claiming every
          customer received the same treatment. But I can document what happened
          to me, and I have no reason to soften it.
        </p>
        <div className="callout">
          <strong>Evidence slot.</strong> The details below are the fields I use to
          record the visit precisely: date, approximate time, what was purchased,
          the amount paid, and a full description of what happened. Any receipt,
          photograph or document I hold is published in the{" "}
          <a href="#evidence">Photos &amp; Supporting Evidence</a> section.
        </div>
        <VisitRecordCard
          record={serviceRecord}
          label="Details of the visit — as documented by me"
        />
      </section>

      {/* ── Section 2 ────────────────────────────────────────── */}
      <section id="staff-language" className="mt-14 scroll-mt-20">
        <h2 className="mt-0">Language and Behaviour in Front of Customers</h2>
        <p>
          While I was standing in the shop as a customer, I heard immature,
          abusive, and inappropriate language being used between staff
          members — co-workers — while customers were present.
        </p>
        <p>
          I am not exaggerating. I am not suggesting every conversation in the
          premises was abusive. But what I heard was audible, aggressive,
          inappropriate communication between staff, delivered in a
          customer-facing area where paying customers could hear it.
        </p>
        <p>
          Whether employees are speaking to customers or to each other, a
          customer should not have to stand in a shop and feel uncomfortable
          because of aggressive or abusive communication around them. Shouting,
          swearing, or belittling language between colleagues in front of
          customers creates an intimidating environment.
        </p>
        <p>
          This is my account of what I heard. If I obtain supporting evidence
          such as recordings or statements from others present, I will publish it
          here rather than simply asserting it.
        </p>
        <VisitRecordCard
          record={languageRecord}
          label="Date, circumstances and evidence — as documented by me"
        />
      </section>

      {/* ── Section 3 ────────────────────────────────────────── */}
      <section id="pricing" className="mt-14 scroll-mt-20">
        <h2 className="mt-0">Concerns About Pricing</h2>
        <p>
          I was charged an amount that I personally felt was higher than what I
          considered normal or expected for the product or service I received. That
          is my honest impression as a customer, and it is the reason I am
          documenting it.
        </p>
        <p>
          I want to be precise about what I am and am not saying. I am not stating
          that the price I paid was illegal, fraudulent, or objectively excessive.
          I do not have the authority to make that judgement, and I have not made
          it here. What I can say is that, in my experience, the amount felt higher
          than the market rate I was familiar with, and that the explanation I was
          given did not resolve my doubts.
        </p>
        <p>
          To keep this fair and verifiable rather than emotional, I record the
          details of the transaction in the table below. Where I have obtained a
          comparable quotation or market price, it is shown next to what I was
          charged so that the difference is visible. Where a receipt exists, it is
          published in the evidence gallery. The table only appears once I have
          entered actual information — I will not display an empty table or
          invent figures to make a point.
        </p>

        {pricing.length > 0 ? (
          <div className="mt-6">
            <div className="table-wrap">
              <table className="doc-table">
                <caption className="sr-only">
                  Pricing information documented by the customer
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Item/Service</th>
                    <th scope="col" className="text-right">
                      Amount Paid
                    </th>
                    <th scope="col" className="text-right">
                      Comparable Price
                    </th>
                    <th scope="col" className="text-right">
                      Difference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((entry) => {
                    const diff =
                      entry.amount_paid !== null && entry.comparable_price !== null
                        ? entry.amount_paid - entry.comparable_price
                        : null;
                    return (
                      <tr key={entry.id}>
                        <td>
                          <span className="font-semibold text-ink">
                            {entry.item}
                          </span>
                          {entry.date && (
                            <span className="block text-xs text-ink-soft">
                              Documented on {formatDate(entry.date)}
                            </span>
                          )}
                          {entry.notes && (
                            <span className="mt-1 block text-[0.88rem] text-ink-soft">
                              {entry.notes}
                            </span>
                          )}
                          {entry.receipt_image_id &&
                            imagesById.get(entry.receipt_image_id) && (
                              <a
                                className="mt-1 inline-block text-[0.85rem] font-semibold"
                                href={`/api/media/${entry.receipt_image_id}`}
                              >
                                View linked receipt/document
                              </a>
                            )}
                        </td>
                        <td className="text-right font-semibold tabular-nums">
                          {formatRupee(entry.amount_paid)}
                        </td>
                        <td className="text-right tabular-nums">
                          {formatRupee(entry.comparable_price)}
                        </td>
                        <td className="text-right tabular-nums">
                          {diff === null ? "—" : formatRupee(diff)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="hint mt-3">
              Figures are as documented by me from the transaction and from
              quotations or prices available to me. Where a comparable price is
              blank, I have not yet obtained a reliable comparison for that item.
            </p>
          </div>
        ) : (
          <p className="note mt-6">
            No pricing records have been entered yet. When I add a transaction,
            the item, the amount I paid, a comparable price and the difference
            will appear here in a table.
          </p>
        )}
      </section>

      {/* ── Section 4 ────────────────────────────────────────── */}
      <section id="reviews" className="mt-14 scroll-mt-20">
        <h2 className="mt-0">A Sudden Increase in Positive Reviews</h2>
        <blockquote className="quote-block">
          I noticed a sudden increase in positive reviews for {SITE.businessName}{" "}
          over a short period of time. This is not a new shop — it has been
          operating in Fraser Town for a long time, and as far as I could tell its
          online reviews used to be few. Then, within a short window, a large
          number of reviews appeared, and almost every one of them was five stars.
          In my experience, staff at the shop have asked customers, in person, to
          leave a five-star review. I am documenting this pattern and the dates I
          observed it, so that anyone reading reviews of this business can take it
          into account and judge for themselves.
        </blockquote>
        <p className="mt-6">
          Reviews are supposed to help people who have never been to a shop make a
          decision. Where staff ask customers directly to post a five-star review —
          particularly while the customer is standing at the counter and the
          transaction is still in progress — the reviews that follow reflect that
          request at least as much as they reflect an independent judgement.
        </p>
        <p>
          The shape of it is what struck me: an old shop with almost no reviews of
          its own, followed by a burst of them, nearly all of them five-star and
          many of them similar in tone. A burst like that is not what you would
          normally expect to see for a business of this age, where reviews tend to
          accumulate slowly over the years and to be mixed.
        </p>
        <p>
          I am not accusing anyone of writing fake reviews, and I am not naming any
          individual. I have no way of knowing who wrote which review or what
          their experience was, and I cannot prove that any particular review was
          fabricated or bought. But I do not rule it out either. It is possible
          that some of those reviews are not genuine — written without the reviewer
          having dealt with the shop, or written to order. I am stating that as a
          possibility I cannot exclude, not as a fact about any individual review
          or person.
        </p>
        <p>
          What I can document is what I personally observed: a long-established
          shop with few reviews, then a large number of positive reviews appearing
          within a short window, nearly all of them five-star, alongside staff
          asking customers face-to-face to leave five-star reviews. I record the
          dates and, where I hold them, the screenshots, so a reader can examine
          the pattern themselves rather than take my word for it — and reach their
          own conclusion about how much weight to give those ratings.
        </p>

        {reviews.length > 0 ? (
          <div className="timeline mt-8">
            {reviews.map((entry) => (
              <div className="timeline-item" key={entry.id}>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                  {entry.date ? formatDate(entry.date) : "Date not recorded"}
                </p>
                <h3 className="mt-1 mb-1">{entry.title}</h3>
                {entry.details && (
                  <p className="mb-1 whitespace-pre-line">{entry.details}</p>
                )}
                {entry.screenshot_image_id &&
                  imagesById.get(entry.screenshot_image_id) && (
                    <a
                      className="text-[0.85rem] font-semibold"
                      href={`/api/media/${entry.screenshot_image_id}`}
                    >
                      View screenshot of this review
                    </a>
                  )}
              </div>
            ))}
          </div>
        ) : (
          <p className="note mt-6">
            No review records have been entered yet. As I document individual
            reviews — with the date shown on the review, the rating and a
            screenshot — they will be listed here in date order.
          </p>
        )}

        {screenshotImages.length > 0 && (
          <div className="mt-8">
            <h3>Review screenshots</h3>
            <Gallery images={screenshotImages} compact />
          </div>
        )}
      </section>

      {/* ── Section 5 ────────────────────────────────────────── */}
      <section id="footpath" className="mt-14 scroll-mt-20">
        <h2 className="mt-0">Footpath Encroachment and Pedestrian Safety</h2>
        <p>
          The area outside the shop is used in a way that makes it difficult for
          people on foot to pass. From what I have observed, tyres, wheels and
          other materials are placed and stored on the footpath and the adjoining
          stretch of road, and vehicles are parked in a manner that blocks the
          walking path.
        </p>
        <p>
          In a locality like Fraser Town, footpaths are used by a lot of people —
          elderly residents, parents with children, school students, delivery
          workers and pedestrians with mobility difficulties. When a footpath is
          occupied by commercial material and parked vehicles, those people are
          pushed onto the road, into moving traffic. That is a road-safety concern
          for the public, not only an inconvenience to me.
        </p>
        <p>
          I have also raised this footpath encroachment with BBMP — I messaged
          them and created a ticket about the footpath being blocked by the
          shop&apos;s stock and parked vehicles. As far as I am aware, no action
          has been taken on it so far. The footpath remains obstructed.
        </p>

        {authority.length > 0 && authority.some((log) => !log.response) && (
          <p className="note mt-6">
            <strong>Current status:</strong> I did raise this matter with{" "}
            {authority
              .filter((log) => !log.response)
              .map((log) => log.authority)
              .join(", ")}{" "}
            and I have documented it in the table below. As at the date recorded
            there, nothing has been done about it: I have received no response and
            the footpath and road outside the premises were still occupied by
            material and parked vehicles when I last checked. The position
            described above therefore remains unchanged.
          </p>
        )}

        {authority.length > 0 ? (
          <div className="mt-6">
            <h3>Authorities contacted — as documented by me</h3>
            <div className="table-wrap">
              <table className="doc-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Authority</th>
                    <th scope="col">Reference</th>
                    <th scope="col">Details &amp; response</th>
                  </tr>
                </thead>
                <tbody>
                  {authority.map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap">
                        {log.date ? formatDate(log.date) : "—"}
                      </td>
                      <td className="font-semibold text-ink">{log.authority}</td>
                      <td>{log.reference_number || "—"}</td>
                      <td>
                        {log.details && (
                          <span className="block whitespace-pre-line">
                            {log.details}
                          </span>
                        )}
                        {log.response ? (
                          <span className="mt-1 block text-[0.88rem] text-ink-soft">
                            Response: {log.response}
                          </span>
                        ) : (
                          <span className="mt-1 block text-[0.88rem] text-ink-soft">
                            No response received, and no action taken, as at the
                            date shown.
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="note mt-6">
            No authority communications have been entered yet. If and when I raise
            this matter with a municipal or traffic authority, I will record the
            date, the authority, the reference number and any response here — and
            if nothing is done about it, this section will say so.
          </p>
        )}

        <a href="#evidence" className="btn btn-outline btn-sm mt-6">
          View photographs in Photos &amp; Supporting Evidence
        </a>
      </section>

      {/* ── Section 6 ────────────────────────────────────────── */}
      <section id="why" className="mt-14 scroll-mt-20">
        <h2 className="mt-0">Why I Created This Website</h2>
        <p>
          I did not create this website to damage anyone&apos;s business. I created
          it because, after my own experience, I found that there was no single
          place where the details of what happened to me could be recorded in an
          organised way — with dates, amounts, photographs and documents sitting
          next to the statements they support.
        </p>
        <p>
          A verbal complaint evaporates. A review can be dismissed as one angry
          line. A note on a phone gets lost. What lasts is a documented record that
          a reader can examine, verify and make their own judgement about. That is
          what this page is: my documentation, published openly, with the evidence
          visible rather than only my conclusions.
        </p>
        <h3>What I am asking for</h3>
        <ul>
          <li>
            That customers are spoken to with ordinary courtesy, without rude or
            insulting behaviour.
          </li>
          <li>
            That abusive or aggressive language between staff is kept out of
            customer-facing areas.
          </li>
          <li>
            That prices are explained clearly, and that customers receive a
            transparent bill or estimate before work begins.
          </li>
          <li>
            That reviews are earned honestly rather than requested at the counter.
          </li>
          <li>
            That the footpath and public road outside the premises are kept clear
            so pedestrians are not pushed into traffic.
          </li>
          <li>
            That when a complaint about the footpath is made, it is acted upon
            rather than left to stand.
          </li>
        </ul>
        <h3>What this page is not</h3>
        <ul>
          <li>
            It is not a claim that every customer of this business has had the
            same experience.
          </li>
          <li>
            It is not a legal finding, and it does not establish that any law or
            rule has been broken.
          </li>
          <li>
            It is not proof that any review is fake. What I set out about reviews
            is a pattern I observed and a question I am not able to answer — not a
            finding that any individual review was written dishonestly.
          </li>
          <li>
            Statements about reviews are my opinion and suspicion, not proven
            accusations against any named reviewer.
          </li>
          <li>
            It is not anonymous — I take responsibility for what is written here
            and am prepared to correct anything I have got wrong, using the{" "}
            <a href="#contact">corrections form</a> below.
          </li>
        </ul>
        <div className="callout mt-6">
          <strong>If you are the owner or a staff member.</strong> If any statement
          on this page is factually incorrect, please use the corrections form at
          the bottom of this page, describing what is wrong and what evidence
          supports your position. Documented corrections and any response you wish
          to have published will be reviewed and shown.
        </div>
      </section>

      {/* ── Evidence gallery ─────────────────────────────────── */}
      <section id="evidence" className="mt-14 scroll-mt-20">
        <h2 className="mt-0">Photos &amp; Supporting Evidence</h2>
        <p>
          This is the documentation that supports the sections above. Each item is
          labelled with a caption, the date it was captured and, where relevant, a
          short description, so that it is clear which statement it relates to.
          Only material I have chosen to publish appears here; items I am still
          reviewing are kept unpublished and are not shown to visitors.
        </p>
        {evidence.length > 0 ? (
          <Gallery images={evidence} />
        ) : (
          <p className="note mt-6">
            No published photographs or documents yet. As I upload photographs of
            the premises, the footpath and the road outside, receipts, bills or
            other documents, they will appear here with a caption and date.
          </p>
        )}
        <p className="hint mt-6">
          If you see something here that you believe is inaccurate, misleading, or
          that reveals someone&apos;s identity unnecessarily, please tell me using
          the corrections form below and I will review it.
        </p>
      </section>

      {/* ── Contact / corrections ───────────────────────────── */}
      <section id="contact" className="mt-14 scroll-mt-20">
        <h2 className="mt-0">Contact / Corrections</h2>
        <p>
          If you are the owner of {SITE.businessName}, a member of staff, or anyone
          else who believes that something on this page is incorrect, you are
          welcome to tell me. Describe clearly:
        </p>
        <ul>
          <li>which section or statement you believe is incorrect;</li>
          <li>what you say is inaccurate, and why;</li>
          <li>what evidence you are able to provide in support of your view;</li>
          <li>
            whether you would like your response to be published on this page.
          </li>
        </ul>
        <CorrectionForm />
        <p className="hint mt-6">
          Location this page relates to: {SITE.businessName}, {SITE.locality}.
        </p>
      </section>

      <div className="mt-14 border-t border-line pt-6">
        <p className="text-[0.9rem] leading-relaxed text-ink-soft">
          This page is a personal record. Nothing here is a substitute for legal
          advice or for the decision of any authority. Readers are encouraged to
          read the supporting evidence and reach their own conclusion.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="#customer-service" className="btn btn-outline btn-sm">
            Back to the beginning
          </a>
          <a href="#evidence" className="btn btn-outline btn-sm">
            See the evidence
          </a>
        </div>
      </div>
    </div>
  );
}