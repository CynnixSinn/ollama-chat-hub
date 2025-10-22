const SequentialThoughtEngine = {
    async processTask(task, context = {}, maxSteps = 10) {
        // Initialize thought process
        const steps = [];
        const availableTools = context.tools || [];
        
        // Break down the task into sequential steps
        const taskParts = this.analyzeTask(task);
        
        // Generate steps for each part
        for (const part of taskParts) {
            if (steps.length >= maxSteps) break;
            
            const step = await this.generateStep(part, {
                previousSteps: steps,
                tools: availableTools,
                context
            });
            
            steps.push(step);
        }
        
        return { steps };
    },
    
    analyzeTask(task) {
        // Split complex task into logical parts
        const parts = [];
        
        // Basic task breakdown - can be enhanced with LLM
        if (task.includes('and')) {
            parts.push(...task.split('and').map(p => p.trim()));
        } else {
            parts.push(task);
        }
        
        return parts;
    },
    
    async generateStep(taskPart, { previousSteps, tools, context }) {
        // Determine required tools
        const relevantTools = tools.filter(tool => 
            this.isToolRelevant(tool, taskPart)
        );
        
        // Generate reasoning
        const reasoning = this.generateReasoning(taskPart, {
            previousSteps,
            tools: relevantTools,
            context
        });
        
        return {
            step: taskPart,
            reasoning,
            tools: relevantTools.map(t => t.name)
        };
    },
    
    isToolRelevant(tool, task) {
        // Simple keyword matching - can be enhanced with embeddings
        const taskLower = task.toLowerCase();
        const descLower = tool.description.toLowerCase();
        
        return descLower.split(' ').some(word => 
            taskLower.includes(word) && word.length > 3
        );
    },
    
    generateReasoning(task, { previousSteps, tools, context }) {
        // Generate explanation for the step
        let reasoning = `This step involves ${task}. `;
        
        if (tools.length > 0) {
            reasoning += `We can use ${tools.map(t => t.name).join(', ')} to accomplish this. `;
        }
        
        if (previousSteps.length > 0) {
            reasoning += `This builds upon ${previousSteps.length} previous steps. `;
        }
        
        return reasoning;
    }
};

module.exports = async function handleSequentialThought(req, res) {
    const { task, context, max_steps } = req.body;
    
    try {
        const result = await SequentialThoughtEngine.processTask(
            task,
            context,
            max_steps
        );
        
        res.json(result);
    } catch (error) {
        console.error('Sequential thought error:', error);
        res.status(500).json({ error: error.message });
    }
};