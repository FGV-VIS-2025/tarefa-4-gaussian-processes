<svelte:head>
    <script>
        MathJax = {
          tex: {inlineMath: [['$', '$'], ['\\(', '\\)']]}
        };
        </script>
        <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>

</svelte:head>


<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import { kernel_Matern12, kernel_Polynomial, kernel_Periodic, kernel_RBF, generateData } from '$components/plots/auxiliares.js';
    import kernelDescriptions from '$components/data/kernels.json';
    import HelperText from '$components/layouts/HelperText.svelte';
    let svg;

    // Dimensões do gráfico
    const backgroundColor = '#f9fafb';
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    const kernels = [
        kernel_RBF,
        kernel_Matern12,
        kernel_Periodic,
        kernel_Polynomial
    ];
    var selectedKernelIndex = 0;
    var desc = kernelDescriptions[selectedKernelIndex].Description;
    var formulaPath = kernelDescriptions[selectedKernelIndex].Formula_Path;

    function draw_kernel_func(data) {
        if (svg) {
            svg.selectAll("*").remove(); // Limpa o SVG antes de desenhar novamente
        }


        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .range([height - margin.bottom, margin.top]);

        const line = d3.line()
            .x(d => x(d.x))
            .y(d => y(d.y));

        svg = d3.select("#indivualKernels-svg")
            .attr("width", width)
            .attr("height", height)
        
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#52DBA4") 
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.append("line")
            .attr("x1", margin.left)
            .attr("y1", height - margin.bottom)
            .attr("x2", width - margin.right)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("opacity", 0.5)
            .attr("stroke-dasharray", "5,5");  
        
        y.domain([0, d3.max(data, d => d.y)])
            .range([height - margin.bottom, margin.top]);
        
    }

    function drawNewKernel()
    {
        const data = generateData(kernels[selectedKernelIndex]);
        // draw_kernel_func(svg, data);
        draw_kernel_func(data);
    }
    
    
    function updateSelectedKernel(index) {
        selectedKernelIndex = index;
        drawNewKernel();
        desc = kernelDescriptions[selectedKernelIndex].Description;
        formulaPath = kernelDescriptions[selectedKernelIndex].Formula_Path;
    }
  
    onMount(() => {
      drawNewKernel();
      MathJax = {
          tex: {inlineMath: [['$', '$'], ['\\(', '\\)']]}
        };
    });;
    // var formula;
    // $:formula = kernelDescriptions[selectedKernelIndex].Formula;
  </script>
  
<div class="container">
    <!-- Título do gráfico -->
    <h2 id="title">Kernel formats</h2>
    <!-- Botões para seleção do Kernel -->
    <div class="kernel-selection">
        <label class="kernel-toggle">
            <input type="radio" id="rbf" name="kernel" value="kernel_RBF" on:input={()=>updateSelectedKernel(0)}/>
            <span>RBF</span>
        </label>
        <label class="kernel-toggle">
            <input type="radio" id="matern" name="kernel" value="kernel_Matern12" on:input={()=>updateSelectedKernel(1)} />
            <span>Matern</span>
        </label>
        <label class="kernel-toggle">
            <input type="radio" id="periodic" name="kernel" value="kernel_Periodic" on:input={()=>updateSelectedKernel(2)}  />
            <span>Periodic</span>
        </label>
        <label class="kernel-toggle">
            <input type="radio" id="polynomial" name="kernel" value="kernel_Polynomial" on:input={()=>updateSelectedKernel(3)} />
            <span>Polynomial</span>
        </label>
    </div>
    <svg id="indivualKernels-svg"></svg>
    <br>
    <!-- <div class = "kernel-explanation" id="kernel-explanation">
        <div class="kernel-description">
            <p>{desc}</p>
        </div>
        <div class="kernel-formula" id="kernel-formula">
            <p>${formula}$</p>
        </div>
    </div> -->
    <HelperText>
        <div class="kernel-description">
            <p>{desc}</p>
        </div>
        <img src={formulaPath} alt="illustration" class="corner-figure" />
        <!-- <div class="kernel-formula" id="kernel-formula">
            <p>${formula}$</p>
        </div> -->
    </HelperText>

</div>


<style>
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&display=swap');

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: 'Fredoka', sans-serif;
        
    }

    .kernel-selection {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        width: 100%;
    }

    .kernel-toggle {
        display: inline-flex;
        align-items: center;
        font-size: 18px;
        cursor: pointer;
        margin: 0 10px;
        transition: color 0.3s ease;
    }

    .kernel-toggle input {
        display: none;
    }

    .kernel-toggle span {
        padding: 5px;
        border: 2px solid transparent;
        border-radius: 5px;
        transition: background-color 0.3s ease, border 0.3s ease;
    }

    .kernel-toggle input:checked + span {
        background-color: #52DBA4;
        color: white;
        border: 1.5px solid #000000;
    }

    .kernel-toggle input:not(:checked) + span:hover {
        background-color: #f0f0f0;
    }

    .kernel-explanation {
        background-color: #e5e7eb; 
        border-radius: 12px;      
        margin-top: 20px;         
        width: 80%;                
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
        font-size: 16px;
        color: #333;
    }
        
</style>