const { compile } = require('@tailwindcss/node');
const fs = require('fs');
const classes = ['opacity-85','bg-primary/35','via-primary/10','from-primary/35','to-transparent','min-h-32','h-4/5','w-4/5','text-[15px]','tracking-wider','card-shadow','glow-primary','border-white/15','bg-background/80','border-dashed','gap-x-4','gap-y-1.5','active:scale-[0.99]','active:opacity-85','bg-card/95','max-w-[64%]','pr-24','rounded-[26px]','bg-surface/80','text-warning','font-display-medium'];
(async () => {
  const css = fs.readFileSync('global.css','utf8');
  const compiler = await compile(css, { base: process.cwd(), onDependency(){} });
  fs.writeFileSync('classes-out.css', compiler.build(classes));
})().catch(e=>{console.error(e);process.exit(1)});
