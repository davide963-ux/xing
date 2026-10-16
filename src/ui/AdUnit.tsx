/**
 * A-ADS banner (https://a-ads.com). Shown on the landing page and the main menu only, never on the
 * game table, so ads never interrupt a game. The iframe is sandboxed: it may run its own script and
 * open the advertiser's page in a new tab, but it cannot navigate this page away.
 */
const AD_UNIT_ID = '2458779'

export function AdUnit({ lazy = false }: { lazy?: boolean }) {
  return (
    <div className="ad-slot">
      <iframe
        data-aa={AD_UNIT_ID}
        title="Reklamë"
        src={`//acceptable.a-ads.com/${AD_UNIT_ID}/?size=Adaptive`}
        loading={lazy ? 'lazy' : undefined}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0, padding: 0, width: '70%', height: 'auto', overflow: 'hidden', display: 'block', margin: 'auto' }}
      />
    </div>
  )
}
