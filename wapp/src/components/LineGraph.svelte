<script lang="ts">
    import * as d3 from "d3";
    import { onMount, createEventDispatcher } from "svelte";

    // 1. CORE PROPS
    export let data: { time: Date; value: number; low?: number; high?: number }[] =
        [];
    export let threshold: number | null = null;
    export let floatingLabels: {
        xValue: Date;
        yValue: number;
        text: string;
    }[] = [];

    // INTERNAL STATE for size
    let width = 0;
    let height = 0;

    // INTERNAL STATE
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    let svgElement: SVGSVGElement;
    let xAxisGroup: SVGGElement;
    let yAxisGroup: SVGGElement;
    let brushGroup: SVGGElement;
    let tooltipElement: HTMLDivElement;

    let tooltipData: { time: Date; value: number } | null = null;
    let tooltipPos = { x: 0, y: 0 };

    const dispatch = createEventDispatcher();

    // Reactive state for the current X-axis domain (for zooming)
    let currentXDomain: [Date, Date] | null = null;

    // 2. D3 CALCULATIONS (SCALES & GENERATORS)
    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    // Domains
    $: initialXDomain = d3.extent(data, (d) => d.time) as [Date, Date];
    $: yDomain = [
        d3.min(data, (d) => (d.low !== undefined ? d.low : d.value)) as number,
        d3.max(data, (d) => (d.high !== undefined ? d.high : d.value)) as number,
    ];

    // Use the zoomed domain if available, otherwise use the initial full domain
    $: finalXDomain = currentXDomain || initialXDomain;

    // Scales
    $: xScale =
        innerWidth > 0
            ? d3.scaleTime().domain(finalXDomain).range([0, innerWidth])
            : d3.scaleTime();
    $: yScale =
        innerHeight > 0
            ? d3.scaleLinear().domain(yDomain).range([innerHeight, 0])
            : d3.scaleLinear();

    // Generators
    $: lineGenerator = d3
        .line<{ time: Date; value: number }>()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.value));

    $: areaGenerator = d3
        .area<{ time: Date; low: number; high: number }>()
        .x((d) => xScale(d.time))
        .y0((d) => yScale(d.low))
        .y1((d) => yScale(d.high))
        .defined((d) => d.low !== undefined && d.high !== undefined);

    // 3. AXES & BRUSH (Imperative D3)
    let brush: d3.BrushBehavior<unknown>;
    onMount(() => {
        brush = d3.brushX().on("end", handleBrushEnd);
    });

    // Reactive updates for brush and axes with transitions
    $: if (brush && brushGroup && innerWidth > 0 && innerHeight > 0) {
        brush.extent([
            [0, 0],
            [innerWidth, innerHeight],
        ]);
        d3.select(brushGroup).call(brush);
    }

    $: if (xScale && xAxisGroup && innerWidth > 0) {
        const xAxis = d3.axisBottom(xScale);
        d3.select(xAxisGroup)
            .transition()
            .duration(750)
            .call(xAxis as any);
    }
    $: if (yScale && yAxisGroup && innerHeight > 0) {
        const yAxis = d3.axisLeft(yScale);
        d3.select(yAxisGroup)
            .transition()
            .duration(750)
            .call(yAxis as any);
    }

    function handleBrushEnd(event: d3.D3BrushEvent<unknown>) {
        if (!event.selection) {
            return; // Ignore empty selections (like a simple click)
        }
        const [x0, x1] = event.selection as [number, number];
        // To get the new domain, we need to invert the pixel values from the *current* scale
        const newDomain = [xScale.invert(x0), xScale.invert(x1)];

        // Dispatch the event to the parent *before* updating the internal state
        dispatch("zoomRegionSelected", newDomain);

        // Update the component's internal domain to trigger the zoom animation
        currentXDomain = newDomain as [Date, Date];

        // Clear the brush selection area visually
        d3.select(brushGroup).call(brush.move, null);
    }

    function handleDblClick() {
        // Reset the domain to the initial full view
        currentXDomain = null;
        // Notify the parent that the zoom has been reset
        dispatch("zoomReset");
    }

    // 4. TOOLTIP
    function handleMouseMove(event: MouseEvent) {
        if (!svgElement) return;
        const pointer = d3.pointer(event, svgElement);
        const x = pointer[0] - margin.left;
        const y = pointer[1] - margin.top;

        if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) {
            tooltipData = null;
            return;
        }

        const time = xScale.invert(x);
        const bisector = d3.bisector((d: { time: Date }) => d.time).left;
        const index = bisector(data, time, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        const d =
            d1 &&
            time.valueOf() - d0.time.valueOf() > d1.time.valueOf() - time.valueOf()
                ? d1
                : d0;

        if (d) {
            tooltipData = d;
            tooltipPos = {
                x: xScale(d.time) + margin.left,
                y: yScale(d.value) + margin.top,
            };
        }
    }

    function handleMouseLeave() {
        tooltipData = null;
    }
</script>

<div
    class="relative w-full h-full"
    bind:clientWidth={width}
    bind:clientHeight={height}
>
    {#if width > 0 && height > 0}
        <svg
            {width}
            {height}
            bind:this={svgElement}
            on:mousemove={handleMouseMove}
            on:mouseleave={handleMouseLeave}
            on:dblclick={handleDblClick}
            role="figure"
            aria-label="Time series line chart showing value over time. Double-click to reset zoom."
            tabindex="0"
        >
            <defs>
                <clipPath id="clip">
                    <rect {width} {height} />
                </clipPath>
            </defs>
            <g transform="translate({margin.left},{margin.top})">
                <!-- Axes -->
                <g bind:this={xAxisGroup} transform="translate(0, {innerHeight})" />
                <g bind:this={yAxisGroup} />

                <!-- Content group with clip path for clean transitions -->
                <g clip-path="url(#clip)">
                    <!-- Band Chart -->
                    <path
                        class="fill-gray-400"
                        d={areaGenerator(
                            data.filter(
                                (d) =>
                                    d.low !== undefined && d.high !== undefined,
                            ) as { time: Date; low: number; high: number }[],
                        )}
                    />

                    <!-- Line Chart with Threshold Coloring -->
                    {#if threshold !== null}
                        <path
                            class="stroke-indigo-500 fill-none stroke-2"
                            d={lineGenerator.defined((d) => d.value < threshold!)(
                                data,
                            )}
                        />
                        <path
                            class="stroke-red-500 fill-none stroke-2"
                            d={lineGenerator.defined((d) => d.value >= threshold!)(
                                data,
                            )}
                        />
                    {:else}
                        <path
                            class="stroke-indigo-500 fill-none stroke-2"
                            d={lineGenerator(data)}
                        />
                    {/if}
                </g>

                <!-- Floating Labels -->
                {#each floatingLabels as label (label.text)}
                    <g
                        transform="translate({xScale(label.xValue)},{yScale(
                            label.yValue,
                        )})"
                    >
                        <circle r="4" class="fill-indigo-600" />
                        <text
                            text-anchor="middle"
                            dy="-0.7em"
                            class="text-xs fill-indigo-800 font-semibold"
                        >
                            {label.text}
                        </text>
                    </g>
                {/each}

                <!-- Brush for Zooming -->
                <g bind:this={brushGroup} />
            </g>
        </svg>

        <!-- Tooltip -->
        {#if tooltipData}
            <div
                bind:this={tooltipElement}
                class="absolute p-2 bg-slate-800 text-white rounded-md text-xs pointer-events-none"
                style="left: {tooltipPos.x + 15}px; top: {tooltipPos.y}px;"
            >
                <div>
                    Time: {d3.timeFormat("%Y-%m-%d %H:%M")(tooltipData.time)}
                </div>
                <div>Value: {tooltipData.value.toFixed(2)}</div>
            </div>
        {/if}
    {/if}
</div>

<style>
    /* Add transition to paths for smooth zooming */
    path {
        transition: d 750ms ease;
    }
</style>

