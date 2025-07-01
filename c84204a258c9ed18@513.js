import define1 from "./e93997d5089d7165@2303.js";

function _1(md){return(
md`# “Race Against the Curve”: How California Counties Balanced Policy and Pandemic
### CSC 173 Final Project
#### Baljot Kaur

`
)}

function _2(md){return(
md`
Each county was literally racing to tighten policies—lockdowns, school closures, mask mandates—fast enough to outpace COVID-19’s exponential growth. The “curve” is both the rising case counts and the urgency of policy responses: counties that acted sooner or more strongly had a better chance of staying ahead of the virus’s surge.`
)}

function _3(md){return(
md`## Every day in spring 2020, California’s counties raced to pull policy levers faster than COVID’s relentless climb. Could any jurisdiction outpace the virus?`
)}

function _4(md){return(
md`In the spring of 2020, California’s 58 counties faced a looming crisis: COVID-19 case counts were soaring, and local leaders scrambled to impose social-distancing, business closures, and mask requirements. Our six-chart story—“Race Against the Curve”—traces how the hardest-hit counties tightened policies, how those interventions varied by sector, and how quickly outbreaks rose and fell in response.

`
)}

function _5(md){return(
md`Before we dive into the six panels, we start with our cornerstone data source:

**Dataset**: “COVID19_CA_County_Dataset.csv”
This daily panel dataset covers all 58 California counties and includes:

Cumulative and new COVID-19 case & death counts

Seven sectoral policy indicators (schools, retail, gatherings, parks, recreation, government, essential retail) per county per day

County demographics (population, population density, age breakdowns, socioeconomic measures)

Date stamps to align cases, policies, and outcomes on a single timeline`
)}

function _covid19_ca_county_dataset1(__query,FileAttachment,invalidation){return(
__query(FileAttachment("COVID19_CA_County_Dataset@1.csv"),{from:{table:"COVID19_CA_County_Dataset"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _7(md){return(
md`## The First Wave’s Explosive Rise
By late March, the combined caseload in Los Angeles, Orange, San Diego, San Francisco, and Santa Clara jumped from under 1,000 to over 5,000 confirmed infections in just one week. The steep slope between March 22 and March 29 shows how rapidly the virus spread once community transmission took hold.`
)}

function _8(md){return(
md`#### LA’s early spike suggests that urban density and travel patterns helped seed rapid spread before any policy interventions could take effect.`
)}

function _9(md){return(
md`##  How rapidly did the first wave of confirmed infections climb in the five hardest-hit counties during the last week of March 2020, and which county drove the surge?`
)}

function _10(htl){return(
htl.html`LA hits 1000
<iframe
  src="https://public.tableau.com/views/chart1_final_project/Top5CountyCasesOverTime_?:showVizHome=no&:embed=true"
  width="800"
  height="600"
  frameborder="0"
/>
`
)}

function _11(md){return(
md`**Interactions: ** 
- Tooltips on hover: As you move your mouse over any area segment you’ll see the exact county name, date, and case count.
- Legend-driven filtering: Click on any county in the legend on the right to isolate (or de-emphasize) that trace. Ctrl-Click (or Cmd-Click) lets you show only one county at a time.
- Pan & zoom the time axis: Use the Tableau toolbar (if you leave it enabled) to zoom into a date range, pan back and forth, or reset to the full view.

`
)}

function _chart1_final(FileAttachment){return(
FileAttachment("chart1_final.jpg").image()
)}

function _13(md){return(
md`**This chart as replacement if the tableau link does not work.**`
)}

function _14(md){return(
md`_On Mar 28, Los Angeles jumps above 1,800 cases in a single day—just as mask requirements go into effect._`
)}

function _15(md){return(
md`Stacked area chart showing cumulative confirmed cases over two weeks for the five hardest-hit counties. A vertical rule marks Los Angeles as the First County to hit 1000 case (Mar 26), and annotated tooltips detail county case counts on key dates.

**Type**: Stacked Area Chart

**Tool/Library:** Tableau

**Interactions**:

- Vertical annotation line on Mar 26 (“First 1000 cases”)
`
)}

function _rawData(FileAttachment){return(
FileAttachment("COVID19_CA_County_Dataset.csv").csv({typed: true})
)}

function _processedData(rawData,d3)
{
  // 1) parse daily rows
  const daily = rawData.map(d => {
    const c = d.California_County && d.California_County.trim();
    if (!c) return null;
    const [m, day, y] = d.Date.split("/").map(Number);
    const date = new Date(Date.UTC(y, m - 1, day));
    if (isNaN(date)) return null;
    return {
      California_County:   c,
      date,
      cumulativeCases:     +d.Cumulative_ConfirmedCases || 0,
      cumulativeDeaths:    +d.Cumulative_Deaths          || 0,
      population:          +d.Population                  || 0,
      density:             +d.Population_Density          || 0,
      // composite stringency score
      stringency: ["Grocery_&_Essential_Retail","Government","Restaurants_&_Bars","Schools","Recreation","Parks","Gatherings"]
        .map(key => {
          const m = {
            Open: 0,
            "Open with modifications": 1,
            "Open only for essential functions": 1.5,
            "Bars closed, delivery/take out only": 1.5,
            Closed: 2,
            "K-12 schools are closed. Colleges online only": 2,
            "Gyms, movie theaters, etc. closed": 2,
            "Except in individual households": 1
          }[d[key]];
          return m || 0;
        })
        .reduce((a,b) => a + b, 0)
    };
  }).filter(Boolean);

  // 2) daily new cases + deaths
  const dailyNew = [];
  for (const [county, rows] of d3.group(daily, d => d.California_County)) {
    rows.sort((a,b) => a.date - b.date);
    let lastC = 0, lastD = 0;
    for (const r of rows) {
      const nc = Math.max(0, r.cumulativeCases  - lastC);
      const nd = Math.max(0, r.cumulativeDeaths - lastD);
      lastC = r.cumulativeCases;
      lastD = r.cumulativeDeaths;
      dailyNew.push({...r, newCases: nc, newDeaths: nd});
    }
  }

  // 3) roll up per-week with per-100 k & carry density
  const weekly = [];
  for (const [county, byWeek] of d3.group(dailyNew, d => d.California_County, d => d3.timeWeek.floor(d.date))) {
    for (const [week, recs] of byWeek) {
      const pop     = recs[0].population;
      const sumC    = d3.sum(recs, d => d.newCases);
      const sumD    = d3.sum(recs, d => d.newDeaths);
      weekly.push({
        California_County:            county,
        Week:                         week,
        Weekly_New_Cases:             sumC,
        Weekly_New_Deaths:            sumD,
        Avg_Stringency:               d3.mean(recs, d => d.stringency),
        Weekly_New_Cases_per_100k:    pop ? sumC / pop * 1000 : 0,
        Weekly_New_Deaths_per_100k:   pop ? sumD / pop * 1000 : 0,
        Population_Density:           recs[0].density
      });
    }
  }
  return weekly;
}


function _18(md){return(
md`## How Quickly Did Counties Lock Down?
This heatmap shows composite stringency scores for every county, across Weeks 11, 12, and 13 of 2020. By Week 12, most large and mid-sized counties reach the darkest greens—indicating maximum closures—whereas many rural counties (purple) remained more open.`
)}

function _19(md){return(
md`#### Urban hubs like Los Angeles and Alameda ratcheted up restrictions by Week 12, while sparsely populated Tulare and Alpine moved more slowly.`
)}

function _20(md){return(
md`## Which counties imposed the strictest COVID-19 restrictions—and how did their composite stringency levels evolve from early March through mid-April?`
)}

function _chart2(vl,processedData){return(
vl
  .data(processedData)

  // full‐width & height so it's nice and big
  .width("container")
  .height(800)

  // make the main title larger
  .title("Heatmap of Policy Stringency of CA County", {
    fontSize: 20,
    anchor:   "start"
  })

  .config({
    view: { stroke: null },

    // bump up all axis titles and labels
    axis: {
      titleFontSize: 14,
      labelFontSize: 12
    }
  })

  // layer just the heatmap tiles
  .layer(
    vl.markRect().encode(
      vl.x()
        .fieldT("Week")
        .timeUnit("yearweek")
        .title("Week")          // inherits titleFontSize=14
        .axis({ labelAngle: 0 }),// keep your labels horizontal

      vl.y()
        .fieldN("California_County")
        .sort({ op: "sum", field: "Weekly_New_Cases", order: "descending" })
        .title("County"),

      vl.color()
        .fieldQ("Avg_Stringency")
        .scale({ scheme: "viridis" })
        .title("Avg. Stringency")
        // legend titles & labels also pick up the axis config, 
        // but you can override with legend:{titleFontSize:..., labelFontSize:...}
    )
  )
  .render()
)}

function _22(md){return(
md`_Some sparsely populated counties (e.g., Alpine, Sierra) maintained relatively low stringency even by week 12, whereas urban counties like Los Angeles and Alameda peak early._`
)}

function _23(md){return(
md`Heatmap of average composite stringency scores across all 58 counties and three weekly snapshots, with darker colors indicating stricter measures. Hover reveals exact stringency values and allows comparison of policy timing and intensity

**Type**: Heatmap (county × week color-grid)

**Tool/Library:** Vega-Lite
`
)}

function _slopeData(d3,processedData)
{
  // our March–June window:
  const start = Date.UTC(2020, 2, 1),
        end   = Date.UTC(2020, 5, 30);

  // group your pre-aggregated weekly data by county
  const byCounty = d3.group(processedData, d => d.California_County);

  // for each county, compute the two summary stats
  return Array.from(byCounty, ([county, rows]) => {
    const sel = rows.filter(r => r.Week >= start && r.Week <= end);
    return {
      California_County: county,
      Avg_Stringency:    d3.mean(sel, r => r.Avg_Stringency),
      Peak_Weekly_Cases: d3.max(sel,  r => r.Weekly_New_Cases)
    };
  });
}


function _slopeLong(slopeData){return(
slopeData.flatMap(d => [
  {
    California_County: d.California_County,
    Metric:             "Avg Stringency",
    Value:              d.Avg_Stringency
  },
  {
    California_County: d.California_County,
    Metric:             "Peak Weekly Cases",
    Value:              d.Peak_Weekly_Cases
  }
])
)}

function _slopeTop10(d3,slopeLong)
{
  // 1) compute each county’s peak from the long data
  const peakByCounty = Array.from(
    d3.rollup(
      slopeLong.filter(d => d.Metric === "Peak Weekly Cases"),
      v => d3.max(v, d => d.Value),
      d => d.California_County
    ),
    ([county, peak]) => ({ county, peak })
  );

  // 2) sort descending, take top 20
  const top10 = peakByCounty
    .sort((a, b) => d3.descending(a.peak, b.peak))
    .slice(0, 10)
    .map(d => d.county);

  // 3) filter the long data
  return slopeLong.filter(d => top10.includes(d.California_County));
}


function _27(md){return(
md`## Stringency vs. Peak Outbreaks
Plotting each county’s average stringency against its peak weekly new cases reveals that even counties with very strict policies (e.g. San Diego, Sacramento) saw major outbreaks. Los Angeles, with the highest composite stringency, still endured the largest peak.`
)}

function _28(md){return(
md`#### Strict alone wasn’t enough—Los Angeles and San Diego both locked down hard yet registered the state’s biggest peaks, reminding us that timing and compliance also matter.`
)}

function _29(md){return(
md`## Across the ten counties with the highest caseloads, how does a county’s average policy stringency relate to its maximum weekly new-case peak?

`
)}

function _chart3(vl,slopeTop10){return(
vl
  .layer(
    // ─── 1) slope lines ────────────────────────────
    vl.markLine({
      point:       { filled: true, size: 80 },
      strokeWidth: 3,
      opacity:     0.8,
      interpolate: "monotone"
    })
    .data(slopeTop10)
    .encode(
      vl.x()
        .fieldO("Metric")
        .scale({ paddingInner: 1.5 })
        .axis({ labelAngle: 0, labelFontSize: 12, titleFontSize: 14 })
        .title("Metric"),
      vl.y()
        .fieldQ("Value")
        .axis({ tickCount: 6, grid: true })
        .title("Value"),
      vl.color()
        .fieldN("California_County")
        .title("County")
        .legend({ columns: 2, labelFontSize: 12, titleFontSize: 14 }),
      vl.detail().fieldN("California_County")
    ),

    // ─── 2) endpoint labels ──────────────────────────
    vl.markText({ align: "left", dx: 5, fontSize: 11 })
    .data(slopeTop10)
    .encode(
      vl.x().value("Peak Weekly Cases"),
      vl.y().fieldQ("Value"),
      vl.text().fieldN("California_County"),
      vl.color().fieldN("California_County")
    )
  ) // end vl.layer(
  .width(850)
  .height(700)
  .title("Policy Change vs. Peak Weekly Cases (Top 10 Counties)", {
    fontSize:   22,
    fontWeight: "bold",
    anchor:     "start"
  })
  .config({
    view: { stroke: null },
    axis: {
      titleFontSize: 16,
      labelFontSize: 12
    }
  })
  .render()
)}

function _31(md){return(
md`_Los Angeles and San Diego emerge as outliers with both high stringency and very large peaks._`
)}

function _32(md){return(
md`Slope lines connect each county’s average policy stringency (Mar–Jun 2020) on the left to its peak weekly new COVID-19 cases on the right, highlighting how stronger restrictions corresponded to higher peaks in cases.

**Type**: Slope Chart (one line per county connecting Avg Stringency → Peak Weekly Cases)

**Tool/Library:** Vega-Lite

**Interactions**: none (static legend)`
)}

function _summary4(d3,processedData,rawData){return(
Array.from(
  d3.group(
    processedData.filter(d => d.Week >= new Date(2020,2,1) && d.Week < new Date(2020,6,1)),
    d => d.California_County
  ),
  ([county, recs]) => {

    const raw = rawData.filter(r => r.California_County.trim() === county)
                       .map(r => {
                         const map = {
                           Open: 0, "Open with modifications": 1,
                           "Open only for essential functions": 1.5,
                           "Bars closed, delivery/take out only": 1.5,
                           Closed: 2,
                           "K-12 schools are closed. Colleges online only": 2,
                           "Gyms, movie theaters, etc. closed": 2,
                           "Except in individual households": 1
                         };
                         return {
                           date: new Date(Date.UTC(...r.Date.split("/").map(Number).reverse())),
                           s_grocery: map[r["Grocery_&_Essential_Retail"]] || 0,
                           s_gov:     map[r.Government]                            || 0,
                           s_rest:    map[r["Restaurants_&_Bars"]]                  || 0,
                           s_school:  map[r.Schools]                                || 0,
                           s_recr:    map[r.Recreation]                             || 0,
                           s_parks:   map[r.Parks]                                  || 0,
                           s_gath:    map[r.Gatherings]                             || 0
                         };
                       })
                       .filter(r => r.date >= new Date(2020,2,1) && r.date < new Date(2020,6,1));

    // compute per-sector weekly averages:
    const mean = arr => arr.length ? d3.mean(arr) : 0;
    const school  = mean(raw.map(r => r.s_school));
    const retail  = mean(raw.map(r => r.s_grocery   + r.s_rest));
    const gather  = mean(raw.map(r => r.s_gath));
    const composite = d3.mean(recs, r => r.Avg_Stringency);

    // split Mar vs Jun for delta:
    const marWindow = recs.filter(r => r.Week < new Date(2020,3,1));
    const junWindow = recs.filter(r => r.Week >= new Date(2020,5,1));
    const marAvg = d3.mean(marWindow, r => r.Avg_Stringency) || composite;
    const junAvg = d3.mean(junWindow, r => r.Avg_Stringency) || composite;
    const delta  = junAvg - marAvg;

    return {
      California_County:       county,
      Avg_Stringency:          composite,
      School_Stringency:       school,
      Retail_Stringency:       retail,
      Gatherings_Stringency:   gather,
     
    };
  }
)
)}

function _long4(summary4){return(
summary4.flatMap(d => [
  { California_County: d.California_County, Metric: "Avg Stringency",        Value: d.Avg_Stringency       },
  { California_County: d.California_County, Metric: "School Stringency",     Value: d.School_Stringency    },
  { California_County: d.California_County, Metric: "Retail Stringency",     Value: d.Retail_Stringency    },
  { California_County: d.California_County, Metric: "Gatherings Stringency", Value: d.Gatherings_Stringency},
 
])
)}

function _metricDomain(){return(
[
  "Avg Stringency",
    "School Stringency",
  
   "Retail Stringency",
 "Gatherings Stringency",
 
 
  
]
)}

function _dims(){return(
[
  { field: "Avg_Stringency",      title: "Avg Stringency"   },
  { field: "Peak_Cases_per_100k",  title: "Peak Cases / 100 k" },
  { field: "Deaths_per_100k",      title: "Deaths / 100 k"    },
  { field: "Density",              title: "Population Density" }
]
)}

function _filtered2(filteredLong4,minAvgStringency){return(
filteredLong4.filter(d =>
  // since filteredLong4 is in “long” form, only keep
  // the Avg Stringency points if they’re ≥ threshold,
  // but keep all other metrics for those counties:
  d.Metric !== "Avg Stringency" ||
  d.Value >= minAvgStringency
)
)}

function _filteredLong4(selectedCounty,long4)
{
  if (selectedCounty === "All") return long4;
  return long4.filter(d => d.California_County === selectedCounty);
}


function _40(md){return(
md`## Dissecting Sectoral Strategies
Rather than one composite score, here we isolate four axes—overall policy, and stringencies on gatherings, retail, and schools—for all counties above a chosen threshold. Use the slider and drop-down to highlight any county.`
)}

function _41(md){return(
md`#### San Francisco closed schools earliest, but its retail and gathering limits didn’t max out until a week later—showing each county’s unique playbook.`
)}

function _42(md){return(
md`## How do counties differ in their emphasis on closing schools, limiting gatherings, and restricting retail—even when they share similar overall stringency scores?`
)}

function _minAvgStringency(slider){return(
slider({
  min:  0, 
  max:  10, 
  step: 0.5, 
  value: 0, 
  title: "Min Avg Stringency"
})
)}

function _selectedCounty(select,processedData){return(
select({
  options: ["All", ...new Set(processedData.map(d => d.California_County))],
  value:   "All",
  label:   "Filter county:"
})
)}

function _chart4(vl,filteredLong4,filtered2,selectedCounty){return(
vl
  .markLine({ interpolate: "monotone", point: true, strokeWidth: 2 })
  .data(filteredLong4) 
.data(filtered2) // <-- use filtered data here
  .encode(
    vl.x().fieldO("Metric").axis({ labelAngle: 0 }),
    vl.y().fieldQ("Value").axis({ grid: true, title: "Score" }),
    vl.detail().fieldN("California_County"),
    vl.color().fieldN("California_County").legend(null),
    vl.tooltip([
      { field: "California_County", type: "nominal",      title: "County" },
      { field: "Metric",            type: "nominal",      title: "Metric" },
      { field: "Value",             type: "quantitative", title: "Score" }
    ])
  )
  .width(800)
  .height(400)
  .title(`Parallel‐Coordinates (filtered: ${selectedCounty})`, { fontSize: 18 })
 
  .render()
)}

function _46(md){return(
md`_ San Francisco prioritized early school closures (high on that axis) even before retail and gathering limits maxed out._`
)}

function _47(md){return(
md`Parallel-coordinates plot of average vs. sector-specific stringency scores (schools, retail, gatherings) for each county, with a slider to exclude low-stringency counties and a dropdown to spotlight a single county’s policy profile.

**Type:** Parallel-Coordinates Plot

**Tool/Library:** Vega-Lite + Observable Inputs

**Interactions:**

- Slider to set minimum Avg Stringency (filters out low-stringency counties)

- Dropdown to select a single county (highlights only that line)`
)}

function _summaryGrowth(d3,processedData){return(
Array.from(
  d3.group(
    processedData.filter(
      d => d.Week >= new Date(2020, 2, 1) && d.Week < new Date(2020, 6, 1)
    ),
    d => d.California_County
  ),
  ([county, recs]) => {
    // get weekly sums of new cases
    const weekly = Array.from(
      d3.rollup(recs, rs => d3.sum(rs, r => r.Weekly_New_Cases), r => r.Week),
      ([week, cases]) => ({ week, cases })
    ).sort((a,b) => a.week - b.week);
    // compute growth ratios
    const ratios = [];
    for (let i = 1; i < weekly.length; i++) {
      const prev = weekly[i-1].cases,
            curr = weekly[i].cases;
      if (prev > 0) ratios.push(curr / prev);
    }
    return {
      California_County:  county,
      Avg_Stringency:     d3.mean(recs, r => r.Avg_Stringency),
      Mean_Growth:        ratios.length ? d3.mean(ratios) : 1,
      Population_Density: d3.mean(recs, r => r.Population_Density)
    };
  }
)
)}

function _filteredGrowth(summaryGrowth,searchText,minGrowth){return(
summaryGrowth
  .filter(d =>
    d.California_County
     .toLowerCase()
     .includes(searchText.toLowerCase())
  )
  .filter(d => d.Mean_Growth >= minGrowth)
  .map(d => ({
    ...d,
    isHighlight: searchText
      ? d.California_County.toLowerCase().includes(searchText.toLowerCase())
      : true
  }))
)}

function _50(md){return(
md`## Linking Policy to Case Growth
Stringency vs. Mean Week-to-Week Growth (filtered by name & growth)
A county’s mean week-to-week growth ratio tells how rapidly cases doubled (or fell). Plotting growth against average policy strength—and filtering by name or minimum growth—reveals that some mid-stringency counties still saw doubling ratios above 2, while a few high-stringency areas pushed ratios near 1 (flat growth).`
)}

function _51(md){return(
md`#### Despite similar overall restrictions, Riverside’s growth hovered around 1.2×/week—while Sacramento’s 8.5 stringency only held its growth to 1.3×—prompting questions about local compliance and contact tracing.`
)}

function _52(md){return(
md`##  What is the relationship between a county’s average COVID-19 policy strength and its average week-to-week case-growth rate?`
)}

function _minGrowth(slider,d3,summaryGrowth){return(
slider({
  min:   d3.min(summaryGrowth, d => d.Mean_Growth),
  max:   d3.max(summaryGrowth, d => d.Mean_Growth),
  step:  0.05,
  value: d3.min(summaryGrowth, d => d.Mean_Growth),
  label: "Min Mean Growth Rate:"
})
)}

function _searchText(Inputs){return(
Inputs.text({
  label:     "Filter by county name:",
  placeholder:"Type any substring…"
})
)}

function _chart5(vl,filteredGrowth){return(
vl
  .markCircle({ stroke: "#333", opacity: 0.8 })
  .data(filteredGrowth)
  .encode(
    vl.x().fieldQ("Avg_Stringency").title("Average Policy Stringency"),
    vl.y().fieldQ("Mean_Growth").title("Mean Week-to-Week Growth"),
    vl.size()
      .fieldQ("Population_Density")
      .title("Population Density"),
    vl.color()
      .condition({ test: "datum.isHighlight", value: "orange" })
      .value("steelblue"),
    vl.tooltip([
      { field: "California_County",   type: "nominal",      title: "County"         },
      { field: "Avg_Stringency",      type: "quantitative", title: "Avg Stringency" },
      { field: "Mean_Growth",         type: "quantitative", title: "Growth Rate"    },
      { field: "Population_Density",  type: "quantitative", title: "Density"        }
    ])
  )
  .width(1000)
  .height(700)
  .title("Stringency vs. Growth Rate (filtered by name & growth)")
  .render()
)}

function _56(md){return(
md`_Some moderate-stringency counties (stringency ~7–8) still experienced growth ratios above 2—indicating cases more than doubled week-to-week._`
)}

function _57(md){return(
md`Scatter plot of average stringency vs. mean week-to-week case-growth rate, colored by population density. A text filter narrows to county names while a slider sets the minimum growth rate, revealing which policies coincided with faster spread.

**Type**: Interactive Scatter Plot

**Tool/Library:** Vega-Lite

**Interactions**:

- Text input (“Filter by county name”) to highlight only matching points

- Slider (“Min Mean Growth Rate”) to filter out low-growth counties
`
)}

function _topCounties(d3,processedData){return(
Array.from(
  d3.rollups(
    processedData,
    v => d3.sum(v, d => d.Weekly_New_Cases),
    d => d.California_County
  )
)
  .sort(([,a],[,b]) => b - a)
  .slice(0, 6)
  .map(([county]) => county)
)}

function _weeklyByCounty(d3,rawData)
{
  // assume processedData has Week, California_County, Cumulative_ConfirmedCases, Cumulative_Deaths,
  // plus each raw policy column (e.g. Schools, Restaurants_&_Bars, etc.)
  const map = d3.group(rawData, d => d.California_County.trim(), d => d.Date);
  const out = [];
  for (const [county, dayMap] of map) {
    for (const [dateStr, recs] of dayMap) {
      const d0 = recs[0];
      out.push({
        date: new Date(Date.UTC(...dateStr.split("/").map(Number).reverse())),
        California_County: county,
        CumCases: +d0.Cumulative_ConfirmedCases,
        CumDeaths: +d0.Cumulative_Deaths,
        Schools:    d0.Schools,
        Retail:     d0["Grocery_&_Essential_Retail"],
        Gatherings: d0.Gatherings,
        Government: d0.Government
      });
    }
  }
  return out;
}


function _60(md){return(
md`## Outbreak Timelines in the Hardest-Hit Counties
Finally, we overlay raw weekly new cases for L.A., Orange, Riverside, San Diego, San Francisco, and Santa Clara. All six peak in the week of Mar 22–28—the high-water mark just as masks become mandatory—and then begin to decline.`
)}

function _61(md){return(
md`#### In these six counties, the peak week aligned almost perfectly with the mask mandate—after which every curve slopes downward, showing the real-world impact of combined interventions.`
)}

function _62(md){return(
md`## When did each of the six most-impacted counties hit their weekly new-case peak, and how quickly did their outbreaks subside afterward?`
)}

function _chart6(vl,processedData,topCounties){return(
vl
  .markLine({ point: true, strokeWidth: 1.5 })
  .data(processedData.filter(d => topCounties.includes(d.California_County)))
  .encode(
    vl.x()
      .fieldT("Week")
      .title("Week")
      .axis({ 
        labelAngle: -45,
        tickCount: 6,
        labelFontSize: 10
      }),
      
    vl.y()
      .fieldQ("Weekly_New_Cases")
      .title("Weekly New Cases")
      .axis({
        grid: true,
        labelFontSize: 10,
        titleFontSize: 12
      }),

    // one line per county, colored by county
    vl.color()
      .fieldN("California_County")
      .title("County")
      .scale({ scheme: "category10" }),
      
    vl.detail()
      .fieldN("California_County"),
      
    vl.tooltip([
      { field: "California_County", type: "nominal",      title: "County"    },
      { field: "Week",               type: "temporal",     title: "Week"      },
      { field: "Weekly_New_Cases",   type: "quantitative", title: "New Cases" }
    ])
  )
  .width(800)
  .height(400)
  .title("Weekly New COVID-19 Cases for Top 6 CA Counties")
  .config({ view: { stroke: null } })
  .render()
)}

function _64(md){return(
md`_Six counties all crossed the finish-line of their first big wave the week of Mar 22–28; then, at last, their curves bent downward._`
)}

function _65(md){return(
md`Overlaid line chart of weekly new cases for the six most-impacted counties, with shared time axis but independent y-scales. Hover tooltips and legend toggles allow focus on any county’s outbreak trajectory.

**Type**: Multi-Series Line Chart (time series, one line per county)

**Tool/Library:** Vega-Lite
`
)}

function _66(md){return(
md`Together, these views tell a story of urgent policy action—from staggered county lockdowns to mask requirements—and their tangible effect on slowing COVID-19’s spread. While strictness alone couldn’t avert large outbreaks in some urban centers, the timing of mandates like masks and school closures clearly marked the turning points in every county’s battle against the curve.`
)}

function _67(md){return(
md`California’s early‐March policy arms race shows that speed matters just as much as strength. While more restrictive counties did eventually bend their curves, urban density and timing gaps still allowed large outbreaks in Los Angeles, Orange, and San Diego. Going forward, public‐health decision-makers should pair rapid response with fine-grained, sectoral interventions—for example, targeting schools and gatherings first in dense areas, then rolling out broad closures as needed.

Rapid, targeted interventions—especially in schools and gatherings—are as critical as broad lockdowns. Timing mattered more than sheer strength.

Overlaying our policy timeline with real-time mobility and testing data could reveal which measures actually slowed transmission fastest. If you’re a public-health official or data-journalist, download the notebook, tweak the date ranges, and share your own “curve-race” analysis for your region.`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["COVID19_CA_County_Dataset.csv", {url: new URL("./files/604405364d8e65e270c14dcc8773ab11593e863ab1d4a2a8b4dae298d7edabc833e1d728998340da8c9a0509231b1387efab07a1d0fbf88148349e7f86a85a40.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["COVID19_CA_County_Dataset@1.csv", {url: new URL("./files/604405364d8e65e270c14dcc8773ab11593e863ab1d4a2a8b4dae298d7edabc833e1d728998340da8c9a0509231b1387efab07a1d0fbf88148349e7f86a85a40.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["chart1_final.jpg", {url: new URL("./files/e56feace21e131a5918a1d4ba68b75f02464582c8676eb5df5dbc92107231fabc15463e3f87310bc256443e55ce30d672822e619e004c04056a9e8e960dfcdea.jpeg", import.meta.url), mimeType: "image/jpeg", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer()).define(["md"], _2);
  main.variable(observer()).define(["md"], _3);
  main.variable(observer()).define(["md"], _4);
  main.variable(observer()).define(["md"], _5);
  main.variable(observer("covid19_ca_county_dataset1")).define("covid19_ca_county_dataset1", ["__query","FileAttachment","invalidation"], _covid19_ca_county_dataset1);
  main.variable(observer()).define(["md"], _7);
  main.variable(observer()).define(["md"], _8);
  main.variable(observer()).define(["md"], _9);
  main.variable(observer()).define(["htl"], _10);
  main.variable(observer()).define(["md"], _11);
  main.variable(observer("chart1_final")).define("chart1_final", ["FileAttachment"], _chart1_final);
  main.variable(observer()).define(["md"], _13);
  main.variable(observer()).define(["md"], _14);
  main.variable(observer()).define(["md"], _15);
  main.variable(observer("rawData")).define("rawData", ["FileAttachment"], _rawData);
  main.variable(observer("processedData")).define("processedData", ["rawData","d3"], _processedData);
  main.variable(observer()).define(["md"], _18);
  main.variable(observer()).define(["md"], _19);
  main.variable(observer()).define(["md"], _20);
  main.variable(observer("chart2")).define("chart2", ["vl","processedData"], _chart2);
  main.variable(observer()).define(["md"], _22);
  main.variable(observer()).define(["md"], _23);
  main.variable(observer("slopeData")).define("slopeData", ["d3","processedData"], _slopeData);
  main.variable(observer("slopeLong")).define("slopeLong", ["slopeData"], _slopeLong);
  main.variable(observer("slopeTop10")).define("slopeTop10", ["d3","slopeLong"], _slopeTop10);
  main.variable(observer()).define(["md"], _27);
  main.variable(observer()).define(["md"], _28);
  main.variable(observer()).define(["md"], _29);
  main.variable(observer("chart3")).define("chart3", ["vl","slopeTop10"], _chart3);
  main.variable(observer()).define(["md"], _31);
  main.variable(observer()).define(["md"], _32);
  const child1 = runtime.module(define1);
  main.import("select", child1);
  main.import("slider", child1);
  main.variable(observer("summary4")).define("summary4", ["d3","processedData","rawData"], _summary4);
  main.variable(observer("long4")).define("long4", ["summary4"], _long4);
  main.variable(observer("metricDomain")).define("metricDomain", _metricDomain);
  main.variable(observer("dims")).define("dims", _dims);
  main.variable(observer("filtered2")).define("filtered2", ["filteredLong4","minAvgStringency"], _filtered2);
  main.variable(observer("filteredLong4")).define("filteredLong4", ["selectedCounty","long4"], _filteredLong4);
  main.variable(observer()).define(["md"], _40);
  main.variable(observer()).define(["md"], _41);
  main.variable(observer()).define(["md"], _42);
  main.variable(observer("viewof minAvgStringency")).define("viewof minAvgStringency", ["slider"], _minAvgStringency);
  main.variable(observer("minAvgStringency")).define("minAvgStringency", ["Generators", "viewof minAvgStringency"], (G, _) => G.input(_));
  main.variable(observer("viewof selectedCounty")).define("viewof selectedCounty", ["select","processedData"], _selectedCounty);
  main.variable(observer("selectedCounty")).define("selectedCounty", ["Generators", "viewof selectedCounty"], (G, _) => G.input(_));
  main.variable(observer("chart4")).define("chart4", ["vl","filteredLong4","filtered2","selectedCounty"], _chart4);
  main.variable(observer()).define(["md"], _46);
  main.variable(observer()).define(["md"], _47);
  main.variable(observer("summaryGrowth")).define("summaryGrowth", ["d3","processedData"], _summaryGrowth);
  main.variable(observer("filteredGrowth")).define("filteredGrowth", ["summaryGrowth","searchText","minGrowth"], _filteredGrowth);
  main.variable(observer()).define(["md"], _50);
  main.variable(observer()).define(["md"], _51);
  main.variable(observer()).define(["md"], _52);
  main.variable(observer("viewof minGrowth")).define("viewof minGrowth", ["slider","d3","summaryGrowth"], _minGrowth);
  main.variable(observer("minGrowth")).define("minGrowth", ["Generators", "viewof minGrowth"], (G, _) => G.input(_));
  main.variable(observer("viewof searchText")).define("viewof searchText", ["Inputs"], _searchText);
  main.variable(observer("searchText")).define("searchText", ["Generators", "viewof searchText"], (G, _) => G.input(_));
  main.variable(observer("chart5")).define("chart5", ["vl","filteredGrowth"], _chart5);
  main.variable(observer()).define(["md"], _56);
  main.variable(observer()).define(["md"], _57);
  main.variable(observer("topCounties")).define("topCounties", ["d3","processedData"], _topCounties);
  main.variable(observer("weeklyByCounty")).define("weeklyByCounty", ["d3","rawData"], _weeklyByCounty);
  main.variable(observer()).define(["md"], _60);
  main.variable(observer()).define(["md"], _61);
  main.variable(observer()).define(["md"], _62);
  main.variable(observer("chart6")).define("chart6", ["vl","processedData","topCounties"], _chart6);
  main.variable(observer()).define(["md"], _64);
  main.variable(observer()).define(["md"], _65);
  main.variable(observer()).define(["md"], _66);
  main.variable(observer()).define(["md"], _67);
  return main;
}
