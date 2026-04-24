import Link from "next/link"
import { getTranslation } from "@lib/util/translations"


type GreenWingPassCTAProps = {
  currentLocale?: string | null
}


export default function GreenWinPassCTA({ currentLocale }: GreenWingPassCTAProps) {
  const t = (key: string) => getTranslation(currentLocale || null, key)

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-center text-3xl font-bold mb-4 text-teal-600">
            {t("greenWingPass.title")}
          </h2>
          <p className="text-center text-gray-800 mb-2 font-medium">
            {t("greenWingPass.subtitle")}
          </p>
          <p className="text-center text-gray-600 mb-12">
            {t("greenWingPass.description")}
          </p>


          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="text-center pt-8 md:pt-0">
              <div className="w-20 h-20 border-2 border-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M82.9316 29.1748C84.7365 27.2755 87.992 27.2755 89.7969 29.1748L89.8057 29.1836C91.7339 31.1428 91.7277 34.292 89.8105 36.207L89.8057 36.2119L75.2148 51.0371L74.9268 51.3291L75.0176 51.7295L82.8789 86.3555L78.6025 90.7305L64.5254 63.3398L64.0518 62.418L63.3242 63.1562L48.6953 78.0205L48.4346 78.2852L48.4873 78.6533L49.7842 87.6973L46.7441 90.7578L40.624 79.5215L40.5215 79.333L40.334 79.2275L29.2129 72.957L32.2461 69.8164L41.2422 71.1699L41.6201 71.2275L41.8877 70.9551L56.4043 56.2051L57.1074 55.4902L56.2227 55.0176L29.2402 40.5898L33.5635 36.2295L67.626 44.2139L68.0361 44.3096L68.332 44.0098L82.9229 29.1836L82.9316 29.1748Z" stroke="#139D87" strokeWidth="1.5" />
                  <circle cx="60" cy="60" r="59" stroke="#139D87" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-900">{t("greenWingPass.feature1Title")}</h3>
              <p className="text-sm text-gray-600">{t("greenWingPass.feature1Desc")}</p>
            </div>


            <div className="text-center pt-8 md:pt-0 md:px-6">
              <div className="w-20 h-20 border-2 border-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M99.928 44.339L99.4737 37.3923L97.7306 38.4319C94.7442 40.2253 90.6819 40.632 86.3928 41.0842C75.4792 42.2142 63.1262 43.48 63.6561 67.6043L63.9594 72.0644C62.5495 73.8876 61.5038 75.937 60.8671 78.1222C59.624 74.4303 57.7297 70.965 55.259 67.9058L55.5166 63.9578C55.9709 42.5157 44.4665 41.3244 35.2353 40.3749C31.4456 39.9831 27.8684 39.6212 25.246 38.0546L23.4878 37L23.0635 43.3893C22.5786 50.6219 24.8826 57.3425 29.5358 62.2847C34.1438 67.182 40.6161 69.8793 47.7405 69.8793C48.3621 69.8793 48.9988 69.8643 49.6354 69.8189L53.3794 69.5629C57.6992 74.9878 60.079 81.7532 60.079 88.6849V92H62.5648V83.2599C62.5648 79.8245 63.7015 76.4489 65.7631 73.7063L70.0678 73.9928C70.7802 74.0382 71.4927 74.0682 72.2051 74.0682C80.2087 74.0682 87.4692 71.0396 92.6527 65.5393C97.8974 60.0091 100.474 52.4593 99.9281 44.3376L99.928 44.339ZM53.0144 63.8531L52.802 67.1383L49.4973 67.3644C42.3428 67.8316 35.8706 65.3903 31.3681 60.6139C27.1698 56.1682 25.1082 50.1109 25.5482 43.5714L25.7148 41.0548C28.4582 42.1698 31.6413 42.5012 34.976 42.8481C44.4654 43.8124 53.4226 44.7467 53.0144 63.8538L53.0144 63.8531ZM90.8488 63.868C85.7407 69.3078 78.3887 72.0805 70.2487 71.538L66.3682 71.2819L66.1106 67.4846C65.6407 45.6949 75.8267 44.6398 86.6199 43.5403C90.4548 43.1485 94.1077 42.7717 97.2302 41.446L97.4269 44.5052C97.9432 51.9342 95.6085 58.8204 90.8488 63.8677L90.8488 63.868Z" fill="#139D87" />
                  <circle cx="60" cy="60" r="59" stroke="#139D87" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-900">{t("greenWingPass.feature2Title")}</h3>
              <p className="text-sm text-gray-600">{t("greenWingPass.feature2Desc")}</p>
            </div>


            <div className="text-center pt-8 md:pt-0 md:px-6">
              <div className="w-20 h-20 border-2 border-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg width="119" height="119" viewBox="0 0 119 119" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M27 45.9064H93.9988M93.9988 53.9245H27.0333M92.7337 38.2485C91.9664 37.4759 90.8974 37 89.7229 37H31.2748C30.1003 37 29.0325 37.4759 28.264 38.2485H28.2491C27.4817 39.0224 27 40.0624 27 41.2226V75.7774C27 76.9376 27.4817 77.9924 28.2491 78.7662H28.264C29.0313 79.5242 30.1003 80 31.2748 80H89.724C90.8985 80 91.9664 79.5242 92.7349 78.7662C93.5183 77.9935 94 76.9376 94 75.7774V41.2226C94 40.0624 93.5183 39.0224 92.7349 38.2485H92.7337Z" stroke="#139D87" strokeWidth="1.5" strokeMiterlimit="10" />
                  <path d="M86.1394 64H74.8606C74.3472 64 73.8814 64.2056 73.5452 64.5363C73.2078 64.8683 73 65.3252 73 65.8303V73.154C73 73.6591 73.209 74.1161 73.5452 74.448C73.8826 74.7799 74.3472 75 74.8606 75H86.1394C86.6528 75 87.1174 74.7787 87.4548 74.448C87.7922 74.1161 88 73.6591 88 73.154V65.8303C88 65.3252 87.7922 64.8683 87.4548 64.5363C87.1174 64.2044 86.6528 64 86.1394 64Z" stroke="#139D87" strokeMiterlimit="10" />
                  <path d="M38.7511 73H34.2314C33.5454 73 33 73.4506 33 74C33 74.5494 33.5454 75 34.2314 75H38.7511C39.4372 75 40 74.5494 40 74C40 73.4506 39.4372 73 38.7511 73Z" stroke="#139D87" strokeMiterlimit="10" />
                  <path d="M58.8544 73H44.1631C43.5242 73 43 73.4506 43 74C43 74.5494 43.5242 75 44.1631 75H58.8544C59.4771 75 60 74.5494 60 74C60 73.4506 59.4758 73 58.8544 73Z" stroke="#139D87" strokeMiterlimit="10" />
                  <circle cx="59.5" cy="59.5" r="58.5" stroke="#139D87" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-900">{t("greenWingPass.feature3Title")}</h3>
              <p className="text-sm text-gray-600">{t("greenWingPass.feature3Desc")}</p>
            </div>


            <div className="text-center pt-8 md:pt-0 md:px-6">
              <div className="w-20 h-20 border-2 border-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 30.0951H80.9368M80.9368 88.1796H40.0632M74.3993 22H46.6007C42.9606 22 40 24.9313 40 28.5355V92.4645C40 96.0687 42.9606 99 46.6007 99H74.3993C78.0394 99 81 96.0687 81 92.4645V28.5355C81 24.9313 78.0394 22 74.3993 22Z" stroke="#139D87" strokeWidth="1.5" strokeMiterlimit="10" />
                  <path d="M64.4395 91H56.5605C55.6997 91 55 91.6726 55 92.5C55 93.3274 55.6997 94 56.5605 94H64.4395C65.3003 94 66 93.3274 66 92.5C66 91.6726 65.3003 91 64.4395 91Z" stroke="#139D87" strokeMiterlimit="10" />
                  <circle cx="60" cy="60" r="59" stroke="#139D87" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="font-bold mb-2 text-gray-900">{t("greenWingPass.feature4Title")}</h3>
              <p className="text-sm text-gray-600">{t("greenWingPass.feature4Desc")}</p>
            </div>
          </div>


          <div className="text-center">
            <Link
              href="/greenwin-pass"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-10 py-3 rounded-lg font-medium transition shadow-md"
            >
              {t("greenWingPass.learnMore")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

