# Interactive transistor lab

## Goal
Create a beginner-friendly, interactive web application showing how bipolar transistors work through circuit diagrams and animated charge flow. Open directly into the lab, not a welcome page.

## The experience
- Put an animated circuit and a synchronized cutaway of the transistor at the center of the screen. Clearly label the base, collector, and emitter.
- Provide two transistor choices, **NPN** and **PNP**, and three circuit arrangements, **common emitter**, **common base**, and **common collector**. All six combinations will be interactive.
- Treat “change the layout” as switching circuit arrangements: redraw the connections, shared terminal, input, and output when the selection changes. Arbitrary drag-and-drop circuit editing is outside this first version.
- Let users adjust the input drive with a slider. Display the resulting base, collector, and emitter currents, with units, and show the transition between off, amplifying, and fully on.
- Use arrangement-appropriate input controls: base drive for common emitter and common collector; emitter drive for common base. Also provide a supply-voltage control to demonstrate the limits of conduction.
- Show the different output behavior: common emitter inverts an input change, common collector follows it, and common base preserves its direction. Keep a small input/output trace synchronized with the selected arrangement.
- Include play/pause, animation speed, and reset controls. A paused animation keeps the circuit available for adjustment and inspection.

## Make the physics understandable
- Distinguish **conventional current** in the wires from **electron or hole motion** inside the transistor; label both rather than presenting them as the same direction.
- Reverse transistor arrows, supply polarities, current directions, and semiconductor layers correctly between NPN and PNP.
- Animate electrons for NPN and holes for PNP. Show most injected carriers reaching the collector and a small base-current contribution, rather than implying the base supplies the entire collector current.
- Maintain the relationship between emitter, base, and collector currents. Limit output current according to supply and load rather than allowing unlimited amplification.
- Keep explanatory text short and contextual: terminal names, current values, operating state, and one concise observation about the selected arrangement.
- Identify this as a simplified educational model, not a component-accurate circuit simulator. Particle speed and density illustrate current; they do not represent real carrier counts or travel times.

## Visual direction
A precision instrument aesthetic: graphite circuit lines on a light workspace, restrained teal and coral accents distinguishing carriers and currents, and crisp sans-serif typography. The animated circuit is the primary visual, with compact controls alongside it and the cutaway directly nearby. Avoid decorative imagery that obscures the electronics. Adapt the arrangement for smaller screens without clipping diagrams or labels, and respect reduced-motion preferences.

## Technical approach
- Build the lab at `/` using the existing TanStack Start application. Add app-specific page titles and social descriptions.
- Separate the educational electrical model, circuit visualization, transistor cutaway, and controls so their state remains synchronized.
- Render purpose-built vector circuit diagrams and charge animations, not prerecorded video, so every control changes the demonstration immediately.
- Use established BJT relationships with an explicit simplified model, fixed illustrative gain, and defined load/bias assumptions. Apply polarity consistently and model cutoff and saturation limits for all arrangements.
- Keep this first version browser-based: no accounts, saved projects, or Cloud services are needed.

## Validation
- Test all six combinations, current conservation, polarity reversal, cutoff, supply/load limits, and the expected output direction for each arrangement.
- Exercise selection changes, current and voltage sliders, pause/resume, speed, and reset in the running application.
- Visually check desktop and smaller-screen layouts, moving carriers, legible labels, and reduced-motion behavior; run the existing routing test and new model tests.

## Scope
This version covers bipolar transistors only. Other electronic elements, arbitrary circuit construction, downloadable videos, and precision device simulation are not included.