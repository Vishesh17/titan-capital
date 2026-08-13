"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type TabKey = "privacy" | "grievance";

const TABS: {
  key: TabKey;
  label: string;
  path: string;
  /** Heading split — first word in upright serif, second word italic + highlighted, matching the rest of the site. */
  headingParts: [string, string];
}[] = [
  {
    key: "privacy",
    label: "Privacy Policy",
    path: "/privacy-policy",
    headingParts: ["Privacy", "Policy"],
  },
  {
    key: "grievance",
    label: "Grievance Redressal",
    path: "/grievance-redressal",
    headingParts: ["Grievance", "Redressal"],
  },
];

/* ════════════════════════════════════════════
   Shared text styles — match the rest of the site
   ════════════════════════════════════════════ */

const proseParagraph =
  "font-['Poppins',_sans-serif] font-light text-[#0E0E0E] leading-[1.7]";
const proseParagraphStyle: React.CSSProperties = {
  fontSize: "clamp(13px, min(1.11vw, 1.63vh), 16px)",
};

const subHeading =
  "font-['Poppins',_serif] font-semibold text-[#001A4D] leading-tight";
const subHeadingStyle: React.CSSProperties = {
  fontSize: "clamp(18px, min(1.67vw, 2.44vh), 24px)",
};

/* ════════════════════════════════════════════
   Privacy Policy content
   ════════════════════════════════════════════ */

function PrivacyPolicy() {
  return (
    <article className="flex flex-col gap-[clamp(14px,1.4vw,22px)]">
      <p className={proseParagraph} style={proseParagraphStyle}>
        TITAN WINNERS FUND MANAGEMENT LLP is a limited liability partnership incorporated under
        the Limited Liability Partnership Act, 2008 (LLPIN: ABD-0345) and having its registered
        office at 3rd Floor, M3M Urbana Business Park, Sector 67, Gurugram, Haryana, India
        (&ldquo;Titan Winners&rdquo;). Titan Winners (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;) owns and operates a website on www.titancapital.vc [to be confirmed]
        (&ldquo;Website&rdquo;) for its users (&ldquo;You&rdquo;/ &ldquo;Your&rdquo;/
        &ldquo;User&rdquo;). Titan Winners values the trust placed in it by its Users and the
        privacy of the Users is important to Titan Winners. This privacy policy (the
        &ldquo;Privacy Policy&rdquo;) together with the terms of use describes how Titan Winners
        collects, uses and discloses the information provided by the Users of the Website. This
        Privacy Policy applies to all Users of our Website. But first, some points to note:
      </p>

      <ul className="ml-[clamp(18px,1.4vw,24px)] flex list-disc flex-col gap-[clamp(8px,0.8vw,12px)]">
        <li className={proseParagraph} style={proseParagraphStyle}>
          The &ldquo;Section Highlights&rdquo; in each clause merely provides a highlight of the
          clause. Reading the highlights is not a replacement for reading the clause. In case of
          a conflict between the highlights and the clause, the clause will prevail.
        </li>
        <li className={proseParagraph} style={proseParagraphStyle}>
          We may revise this Privacy Policy as well as update the Website from time to time, so
          please keep visiting this page regularly to take notice of any changes we make.
        </li>
        <li className={proseParagraph} style={proseParagraphStyle}>
          If You do not agree with the processing policies laid out in this Privacy Policy, You
          should not use our Website. By using, visiting our Website, You have agreed to Privacy
          Policy.
        </li>
      </ul>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We shall not use the User&rsquo;s information in any manner except as provided under this
        Privacy Policy. Every User who accesses or uses the Website shall be bound by this Privacy
        Policy. This Privacy Policy sets out the type of information collected from the Users,
        including the nature of the sensitive personal data or information, the purpose, means
        and modes of usage of such information and how and to whom we shall disclose such
        information.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        This Privacy Policy is published pursuant to Section 43A of the Information Technology
        Act, 2000, Regulation 4 of the Information Technology (Reasonable Security Practices and
        Procedures and Sensitive Personal Information) Rules, 2011 and Regulation 3(1) of the
        Information Technology (Intermediaries Guidelines) Rules, 2011.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        Please read the Privacy Policy in totality to learn about the information gathering and
        dissemination practices of Titan Winners. Every User who accesses or uses the Website
        shall be bound by this Privacy Policy.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We reserve our right to update this Privacy Policy at any time, with or without any
        notice. We shall not be required to notify the Users of any changes made to this Privacy
        Policy. It is the responsibility of the Users to review the terms of this Privacy Policy
        periodically.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        By mere access or use of the Website, the User expressly consent to our use and
        disclosure of the User&rsquo;s personal information in accordance with this Privacy
        Policy. This Privacy Policy is incorporated into and subject to the Terms of Use.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        In general, the User can browse the Website without telling us who it is or revealing any
        Personal Information about himself/herself. A User is required to provide Personal
        Information when such a User chooses to subscribe for the material/content at our
        Website. Where possible, we indicate which fields are required and which fields are
        optional. All the information provided to us by a User, including Personal Information
        and personally identifiable information, is voluntary.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        The User always has the option to not provide information by choosing not to use a
        particular feature on the Website. It is the User&rsquo;s duty to ensure strict caution
        while giving out any personally identifiable information about himself/herself/itself or
        his/her family members.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        When the User accesses or uses the Website, we collect and store the personal information
        provided by the User from time to time during the course of its use or access of the
        Website. The purpose of doing so is to improve the Website experience and provide Users
        with a safe, efficient, smooth, and customized experience. The Privacy Policy applies to
        information collected and processed by us, including but not limited to, the following:
      </p>

      <ul className="ml-[clamp(18px,1.4vw,24px)] flex list-disc flex-col gap-[clamp(8px,0.8vw,12px)]">
        <li className={proseParagraph} style={proseParagraphStyle}>
          Personal information is information related to a visitor, or a combination of pieces of
          information that could reasonably allow him to be identified. Personal information may
          consist of: full name; personal contact numbers; residential address; email address;
          gender; date of birth. While information such as date of birth in isolation may not be
          enough to uniquely identify the visitor, a combination of full name and date of birth
          may be sufficient to do so.
        </li>
        <li className={proseParagraph} style={proseParagraphStyle}>
          Sensitive personal data or information is such personal information that is collected,
          received, stored, transmitted or processed by us, consisting of: Password; Physical,
          physiological and mental health condition; Sexual orientation; Any detail relating to
          the above personal information categories as provided to us; Any of the information
          received under above personal information categories by us for processing, stored or
          processed under lawful contract or otherwise. Please note that any information that is
          freely available or accessible in public domain or furnished under the Right to
          Information Act, 2005 or any other law for the time being in force shall not be
          regarded as sensitive personal information.
        </li>
      </ul>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We collect Your Personal Information from You when You provide that Personal Information
        to us directly, such as while subscribing or visiting our Website. We may also collect
        Personal Information from third parties when You have authorized someone else to supply
        Your Personal Information to us.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We may store Your Personal Information both physically and electronically. Physical
        storage will occur at our premises, whereas electronic storage occurs on devices and may
        include storing Personal Information on the cloud, including using third-party service
        providers. We take reasonable steps and security safeguards to protect Personal
        Information against loss, unauthorized use, and other misuse. Where Personal Information
        is no longer required by us, we will delete the Personal Information or permanently
        de-identify it in accordance with the applicable laws and our records management policy.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        Users can modify and correct the data about him/her/it which has been collected pursuant
        to his/her/its decision to become a User. Any grievances in relation to the information
        shared by the User with us may be brought to the attention of grievance officer mentioned
        herein. You may also contact us to confirm if we are processing any information relating
        to You. We will respond to Your request within a reasonable timeframe.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        The Website uses temporary cookies to store certain data. We do not store personally
        identifiable information in the cookies. Information collected by us, by any means
        whatsoever, that does not personally identify the User as an individual (such as patterns
        of utilization described above) is exclusively owned by us and may be used by us and
        third-party service providers for technical administration of the Website, User
        administration, research, development, and other purposes. Additionally, we may sell or
        otherwise transfer such research, statistical or intelligence data in an aggregated or
        non-personally identifiable form to our parent company, group companies, subsidiaries,
        associates, affiliates, suppliers, vendors, sister concerns, service providers and
        service partners and other third parties (collectively referred to as &ldquo;Other
        Parties&rdquo;).
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        A User may set or amend his/her/its web browsers to delete or disable cookies. If a User
        chooses to disable cookies on his/her/its computer or mobile telecommunication device, it
        may impair, degrade, or restrict access to certain areas of the Website. Merely closing
        the web browser should ordinarily clear all temporary cookies installed by us. However,
        Users are encouraged to use the &ldquo;clear cookies&rdquo; functionality of their
        browsers to ensure deletion, as we cannot guarantee, predict, or provide for the behavior
        of the equipment of all the Users of the Website.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        Due to the communication standards on the internet, when a User visits the Website, we
        automatically receive the uniform resource locator of the site from which such User
        visits the Website, details of the website such User is visiting on leaving the Website,
        the internet protocol (&ldquo;IP&rdquo;) address of each User&rsquo;s computer operating
        system, type of web browser the User is using, email patterns, and the name of the
        User&rsquo;s internet service provider. This information is used solely to analyse
        overall User trends and to help us in improving our Website. Please note that the link
        between the User&rsquo;s IP address and the User&rsquo;s personally identifiable
        information is not shared with third parties without such User&rsquo;s permission or
        except when required by law. Notwithstanding the above, the User acknowledges our right
        to share some of the aggregate findings, including the personal information provided by
        the Users in an unidentifiable form, and not the specific data with advertisers,
        sponsors, investors, strategic partners, and others in order to help grow the business.
        The amount of information sent to us depends on the settings of the web browser used by
        the User to access the Website. The User may refer to the browser used, if the User
        wishes to learn what information is provided to us.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We do not exercise control over the websites displayed as search results or links from
        within the Website. These other sites may place their own cookies or other files on the
        Users&rsquo; computer, collect data or solicit personal information from the Users, for
        which we shall not be held responsible or liable. We do not make any representations
        concerning the privacy practices or policies of such third parties or terms of use of
        such websites, nor do we guarantee the accuracy, integrity, or quality of the
        information, data, text, software, sound, photographs, graphics, videos, messages or
        other materials available on such websites. The inclusion or exclusion does not imply any
        endorsement by us of such websites, the websites&rsquo; provider, or the information on
        the website.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We may keep records of telephone calls received from and made to Users for the purpose of
        research and development, training, business intelligence, business development, or for
        User administration. We may share the telephone records with third parties when required
        by law or when required to provide or facilitate the User with any services.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We may choose to conduct contests and surveys to collect relevant information about the
        Users&rsquo; preferences. These surveys and contests are optional and if the User chooses
        to respond, his/her/its responses will be kept anonymous. The demographic information
        that the User provides while on the Website and through any surveys or contests is used
        to help us in improving our Website to meet the needs and preferences of Users.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        When a User visits or uses the Website, we may access, collect, monitor and/or remotely
        store data in relation to the User&rsquo;s location, which may also include global
        positioning system coordinates or similar information regarding the location of the
        device using which the User has visited or used the Website. The location data does not
        collect or share any personally identifiable information about the User.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We do not knowingly collect personal data from children (only persons above the age of 18
        (eighteen) shall be permitted to use the Website as provided in the Terms of Use). In an
        event, where in contravention of the Terms of Use, a person below the age of 18
        (eighteen) uses the Website, we shall not be held liable or responsible for any damage or
        injury suffered by such person in making use of the Website.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We may be required to disclose personal information to governmental institutions or
        authorities when such disclosure is requisitioned under any law or judicial decree or
        when we, in our sole discretion, deems it necessary in order to protect our rights or the
        rights of others, to prevent harm to persons or property, to fight fraud and credit risk,
        or to enforce or apply the terms of use.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        All our employees and data processors, who have access to and are associated with the
        processing of personal information provided by Users are obliged to respect the
        confidentiality of every User&rsquo;s personal information.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We have implemented security policies, rules and technical measures, as required under
        applicable law including firewalls, transport layer security and other physical and
        electronic security measures to protect the personal information that it has under its
        control from unauthorized access, improper use or disclosure, unauthorized modification
        and unlawful destruction or accidental loss. It is expressly stated that we shall not be
        responsible for any breach of security or for any action of any third parties that
        receive Users&rsquo; personal data or events that are beyond our reasonable control
        including, acts of government, computer hacking, unauthorized access to computer data and
        storage device, computer crashes, breach of security and encryption, etc.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We may share/use personal information and personally identifiable information provided by
        Users with the Other Parties for the purposes of: enabling Users to enjoy the Website,
        including sharing information with Other Parties to provide services, technical support
        etc.; or detecting and preventing identity theft, fraud or any other potentially illegal
        acts; or monitoring and enhancing User interest and engagement, including through
        promotional activity, personal messages to Users using personally identifiable
        information provided by Users.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        To the extent that Other Parties have access to the personal information, we shall make
        efforts to ensure that the Other Parties treat such personal information at least as
        protectively as they treat personally identifiable information obtained from their users
        or members.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We use the services of third-party processors to host User data. Transfers of data to
        these third-party processors are done under contract in compliance with applicable law.
        In the event that we transfer Your personal data outside Your jurisdiction of residence,
        we do it in compliance with applicable law. If You reside in Europe, all transfers of
        Your personal data outside Europe are done in compliance with the General Data Protection
        Regulation.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We or the Other Parties may merge with or be acquired by another business entity. In such
        an event, we and the Other Parties may be required to transfer the personal information
        to such merging or acquiring party, as the case may be. While sharing such personal
        information with the acquiring or merging entity, as the case may be, we and the Other
        Parties shall make reasonable endeavours to ensure that the User&rsquo;s personal
        information is duly protected by the acquiring or merging entity, as the case may be, by
        undertaking security measures prescribed under applicable laws.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We may also disclose or transfer the personal and other information provided by Users, to
        any third party as a part of reorganization or a sale of the assets, division or transfer
        of a part or whole of Titan Winners. Any third party to whom we transfer or sell its
        assets, will have the right to continue to use the personal and other information that
        Users provide to us.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We may also disclose Your personal information as required by law, when we believe in
        good faith that disclosure is necessary to protect our rights, protect Your safety or the
        safety of others, investigate fraud, or respond to a government request. If we are
        involved in a merger, acquisition, or sale of all or a portion of our assets, You will be
        notified via email and/or a prominent notice on our Website of any change in ownership,
        uses of Your personal information, and choices You may have regarding Your personal
        information.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        All information collected from the Users by us is maintained in electronic form on
        servers and/or cloud systems and shall be accessible by our certain employees. The User
        information may also be converted to physical form from time to time. Regardless of the
        manner of storage, we shall make commercially reasonable endeavors to ensure that the
        User information is rendered confidential and will disclose User information only in
        accordance with the terms of this Privacy Policy.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        The User consents to reproducing/publishing all testimonials and reviews given by the
        User (whether on social media websites or in any other manner whatsoever) in relation to
        Titan Winners, together with the User&rsquo;s name and location, on such page and in such
        position as we may determine in its sole discretion. The User agrees that we may edit the
        testimonials and reviews provided by the User and reproduce/publish such edited or
        paraphrased versions of the testimonials and reviews. If the User has any concerns with
        the reproduction/publication of any testimonial or review provided by the User, the User
        may contact us at [contact email to be confirmed].
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        The third-party service providers with whom we may share personal information provided by
        Users are not permitted to market their own services or send promotional emails or engage
        in promotional communication with the Users. We provide all Users with the opportunity to
        opt-out of receiving non-essential, promotional, or marketing-related communication from
        us or our partners. These settings can be found on the Website.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        If a User wishes to remove his/her/its contact information from all our lists and
        newsletters, the User can click on the &ldquo;unsubscribe&rdquo; link or follow the
        instructions in each email message. Alternatively, the User can contact us at [contact
        email to be confirmed]. All Users will be notified by email prior to any actions taken.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        We may from time to time send You Titan Winners-related announcements when we consider it
        necessary to do so (such as when we temporarily suspend the Website for maintenance or
        security, privacy, or administrative-related communications). We send these to You via
        SMS or email, as we deem fit. You may not opt out of such Titan Winners-related
        communications.
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        The Website is made available by Titan Winners Fund Management LLP, having its registered
        office at 3rd Floor, M3M Urbana Business Park, Sector 67, Gurugram, Haryana, India. In
        accordance with applicable law (including Information Technology (Intermediary Guidelines
        and Digital Media Ethics Code) Rules, 2021, Information Technology (Procedure and
        Safeguards for Interception, Monitoring, and Decryption) Rules, 2009, Information
        Technology (Procedure and Safeguards for Blocking for Access of Information by Public)
        Rules, 2009, and Information Technology (Procedure and Safeguard for Monitoring and
        Collecting Traffic Data or Information) Rules, 2009), we have appointed [Grievance
        Officer name to be confirmed] accessible via email at [grievance email to be confirmed]
        as our grievance officer (&ldquo;Grievance Officer&rdquo;).
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        You can contact our Grievance Officer confidentially by email to inquire about the
        treatment of Your data, including the deleting of Your personal data as identified in
        this document.
      </p>
    </article>
  );
}

/* ════════════════════════════════════════════
   Grievance Redressal content
   ════════════════════════════════════════════ */

const fundI = {
  name: "Titan Capital Winners Fund I",
  description:
    "Titan Capital Winners Fund I (“Fund”) is registered with SEBI as a Category II Alternative Investment Fund.",
  effectiveDate: "",
  registrationNumber: "IN/AIF2/23-24/1358",
  registeredOffice: "M3M Urbana Business Park, Sector 67, Gurugram, Haryana, India",
  investmentManager: "Titan Winners Fund Management LLP",
  trustee: "Catalyst Trusteeship Limited",
  sponsor: "TC Sponsor & Services LLP",
};

const fundII = {
  name: "Titan Capital Fund II",
  description:
    "Titan Capital Fund II (“Fund”) is registered with SEBI as a Category II Alternative Investment Fund.",
  effectiveDate: "[to be confirmed]",
  registrationNumber: "IN/AIF2/26-27/2125",
  registeredOffice: "M3M Urbana Business Park, Sector 67, Gurugram, Haryana, India",
  investmentManager: "Titan Winners Fund Management LLP",
  trustee: "Catalyst Trusteeship Limited",
  sponsor: "TC Sponsor & Services LLP",
};

function FundDetailsBlock({ title, fund }: { title: string; fund: typeof fundI }) {
  const rows: { label: string; value: string }[] = [
    { label: "Fund Name", value: fund.description },
    { label: "Effective Date", value: fund.effectiveDate || "—" },
    { label: "Registration Number", value: fund.registrationNumber },
    { label: "Registered office of the Fund", value: fund.registeredOffice },
    { label: "Investment Manager", value: fund.investmentManager },
    { label: "Trustee", value: fund.trustee },
    { label: "Sponsor to the Fund", value: fund.sponsor },
  ];

  return (
    <div
      className="flex w-full flex-col bg-white"
      style={{
        borderRadius: "clamp(8px, 0.8vw, 12px)",
        boxShadow: "12px 12px 24px -8px rgba(207, 207, 207, 0.25)",
        padding: "clamp(18px, min(2vw, 3vh), 32px)",
      }}
    >
      <h3
        className="font-['Poppins',_serif] font-semibold text-[#001A4D]"
        style={{
          fontSize: "clamp(18px, min(1.67vw, 2.44vh), 22px)",
          marginBottom: "clamp(14px, min(1.6vw, 2.3vh), 22px)",
        }}
      >
        {title}
      </h3>
      <div className="flex w-full flex-col gap-[clamp(12px,1.2vw,18px)]">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex w-full flex-col gap-[clamp(2px,0.3vw,4px)] md:flex-row md:items-baseline md:gap-[clamp(12px,1.2vw,20px)]"
          >
            <span
              className="font-['Poppins',_sans-serif] font-normal text-[#575757] md:w-[260px] md:shrink-0"
              style={{ fontSize: "clamp(12px, min(1.04vw, 1.53vh), 14px)" }}
            >
              {label}
            </span>
            <span
              className="font-['Poppins',_sans-serif] font-normal text-black"
              style={{ fontSize: "clamp(13px, min(1.11vw, 1.63vh), 16px)" }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GrievanceRedressal() {
  return (
    <article className="flex flex-col gap-[clamp(20px,1.8vw,32px)]">
      <p
        className="font-['Poppins',_sans-serif] font-normal text-[#575757]"
        style={{ fontSize: "clamp(12px, min(1.04vw, 1.53vh), 14px)", letterSpacing: "0.04em" }}
      >
        INVESTOR RELATIONS &amp; GOVERNANCE
      </p>

      <p className={proseParagraph} style={proseParagraphStyle}>
        At Titan Capital, investor satisfaction is our foremost agenda.
      </p>

      <div>
        <h2 className={subHeading} style={subHeadingStyle}>
          In case of any grievance or complaint
        </h2>
        <ul className="ml-[clamp(18px,1.4vw,24px)] mt-[clamp(10px,1vw,16px)] flex list-disc flex-col gap-[clamp(8px,0.8vw,12px)]">
          <li className={proseParagraph} style={proseParagraphStyle}>
            For Titan Capital Winners Fund I &mdash; please email us at{" "}
            <a
              href="mailto:ir@titancapital.vc"
              className="text-[#001A4D] underline decoration-solid hover:opacity-70"
            >
              ir@titancapital.vc
            </a>
            .
          </li>
          <li className={proseParagraph} style={proseParagraphStyle}>
            For Titan Capital Winners Fund II &mdash; please email us at{" "}
            <a
              href="mailto:ir@titancapital.vc"
              className="text-[#001A4D] underline decoration-solid hover:opacity-70"
            >
              ir@titancapital.vc
            </a>
            .
          </li>
          <li className={proseParagraph} style={proseParagraphStyle}>
            For escalation, please get in touch with our Chief Compliance Officer Mr. Chetan Rana
            at{" "}
            <a
              href="mailto:chetan@titancapital.vc"
              className="text-[#001A4D] underline decoration-solid hover:opacity-70"
            >
              chetan@titancapital.vc
            </a>
            .
          </li>
          <li className={proseParagraph} style={proseParagraphStyle}>
            In case you are not satisfied with our response you can lodge your grievance with SEBI
            at{" "}
            <a
              href="https://scores.sebi.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-[#001A4D] underline decoration-solid hover:opacity-70"
            >
              https://scores.sebi.gov.in
            </a>{" "}
            or you may also write to any of the offices of SEBI. For any queries, feedback or
            assistance, please contact the SEBI office on toll-free Helpline at 1800 22 7575 /
            1800 266 7575.
          </li>
          <li className={proseParagraph} style={proseParagraphStyle}>
            In case you are still not satisfied with the resolution through the SCORES portal, you
            can initiate the dispute resolution through the ODR portal at{" "}
            <a
              href="https://smartodr.in/login"
              target="_blank"
              rel="noreferrer"
              className="text-[#001A4D] underline decoration-solid hover:opacity-70"
            >
              https://smartodr.in/login
            </a>
            .
          </li>
        </ul>
      </div>

      <div>
        <p
          className="font-['Poppins',_sans-serif] font-medium text-[#0E0E0E]"
          style={{ fontSize: "clamp(13px, min(1.11vw, 1.63vh), 16px)" }}
        >
          Note: The dispute resolution through ODR will not be possible, if:
        </p>
        <ul className="ml-[clamp(18px,1.4vw,24px)] mt-[clamp(8px,0.8vw,12px)] flex list-disc flex-col gap-[clamp(6px,0.6vw,10px)]">
          <li className={proseParagraph} style={proseParagraphStyle}>
            The complaint or grievance is not raised with the compliance officer first and
            subsequently on the SCORES portal.
          </li>
          <li className={proseParagraph} style={proseParagraphStyle}>
            Dispute raised is pending before any arbitral process or court or tribunal.
          </li>
          <li className={proseParagraph} style={proseParagraphStyle}>
            Dispute is non-arbitrable in terms of Indian law.
          </li>
          <li className={proseParagraph} style={proseParagraphStyle}>
            Dispute is time-barred in terms of law of limitation.
          </li>
        </ul>
      </div>

      <FundDetailsBlock title="Fund Details — Titan Capital Winners Fund I" fund={fundI} />
      <FundDetailsBlock title="Fund Details — Titan Capital Winners Fund II" fund={fundII} />
    </article>
  );
}

/* ════════════════════════════════════════════
   Main component
   ════════════════════════════════════════════ */

export default function LegalContent({ initialTab }: { initialTab: TabKey }) {
  const [active, setActive] = useState<TabKey>(initialTab);
  const router = useRouter();

  const handleTabClick = (tab: TabKey) => {
    if (tab === active) return;
    setActive(tab);
    const target = TABS.find((t) => t.key === tab);
    if (target) router.replace(target.path, { scroll: false });
  };

  const activeTab = TABS.find((t) => t.key === active);
  const [headingWord1, headingWord2] = activeTab?.headingParts ?? ["", ""];

  return (
    <section
      className="relative flex w-full flex-col items-center bg-white"
      style={{
        paddingTop: "clamp(80px, min(8vw, 11vh), 140px)",
        paddingBottom: "clamp(40px, min(6.94vw, 10.18vh), 100px)",
      }}
    >
      <div
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col"
        style={{
          paddingLeft: "var(--section-px-wide, 5%)",
          paddingRight: "var(--section-px-wide, 5%)",
        }}
      >
        {/* ── HEADING — same Libre Baskerville size as other site headings ── */}
        <motion.h1
          key={active}
          className="m-0 font-['Poppins',_serif] text-[length:var(--heading-xl)] max-md:!text-[28px] font-semibold not-italic leading-none text-[#001A4D]"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {headingWord1} {headingWord2}
        </motion.h1>

        {/* ── TABS ── */}
        <div
          role="tablist"
          aria-label="Legal sections"
          className="relative mt-[clamp(20px,2vw,32px)] flex w-full flex-row gap-[clamp(8px,1vw,16px)] border-b border-[#E0E0E0]"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`relative cursor-pointer border-0 bg-transparent font-['Poppins',_sans-serif] transition-colors duration-200 ${
                  isActive ? "text-[#001A4D]" : "text-[#667085] hover:text-[#001A4D]"
                }`}
                style={{
                  fontSize: "clamp(13px, min(1.18vw, 1.74vh), 17px)",
                  fontWeight: isActive ? 600 : 400,
                  padding:
                    "clamp(10px, min(1vw, 1.5vh), 16px) clamp(10px, min(1.2vw, 1.8vh), 20px)",
                }}
              >
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="legal-tab-underline"
                    className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-[#001A4D]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div className="mt-[clamp(24px,2.4vw,40px)] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {active === "privacy" ? <PrivacyPolicy /> : <GrievanceRedressal />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
