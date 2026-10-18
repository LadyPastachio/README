import { protectLoops, type SyntaxProblem } from './protectLoops';

/**
 * Builds the page that runs inside the sandboxed preview.
 *
 * It works like a real browser: style.css and script.js are only used if
 * index.html links to them. A small "prelude" script is added first. It
 * forwards console output and errors to the lab, stops runaway loops, and
 * disables links and form submissions so the preview can't navigate away.
 *
 * Security comes from where this runs, not from this code: the preview is an
 * <iframe sandbox="allow-scripts"> without allow-same-origin, so it can't
 * read the app, its storage or any cookies. A Content-Security-Policy also
 * blocks all network requests.
 */

export interface LabFiles {
  html: string;
  css: string;
  js: string;
}

export interface CheckSpec {
  id: string;
  /** Body of an async function(doc, logs, source) that returns true when the check passes. Trusted lesson content. */
  test: string;
}

export interface BuildResult {
  html: string;
  linked: { css: boolean; js: boolean };
  syntaxError: SyntaxProblem | null;
}

export const LAB_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'; form-action 'none'; base-uri 'none'";

const CSS_LINK = /<link\b[^>]*\bhref\s*=\s*["']\.?\/?style\.css["'][^>]*>/i;
const JS_TAG = /<script\b[^>]*\bsrc\s*=\s*["']\.?\/?script\.js["'][^>]*>\s*<\/script\s*>/i;

/** Keeps learner text from closing our <script>/<style> tags early. */
const escapeScript = (s: string) => s.replace(/<\/script/gi, '<\\/script');
const escapeStyle = (s: string) => s.replace(/<\/style/gi, '<\\/style');

export function findLinks(html: string) {
  return { css: CSS_LINK.test(html), js: JS_TAG.test(html) };
}

export function buildDocument(files: LabFiles, runId: string, checks: CheckSpec[] = []): BuildResult {
  const linked = findLinks(files.html);
  let syntaxError: SyntaxProblem | null = null;
  let html = files.html;

  if (linked.css) {
    html = html.replace(CSS_LINK, () => `<style data-file="style.css">${escapeStyle(files.css)}</style>`);
  }
  if (linked.js) {
    const protectedJs = protectLoops(files.js);
    if (protectedJs.ok) {
      html = html.replace(JS_TAG, () => `<script>${escapeScript(protectedJs.code)}\n//# sourceURL=script.js\n</script>`);
    } else {
      syntaxError = protectedJs.error;
      html = html.replace(JS_TAG, '');
    }
  }

  const head = `<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${LAB_CSP}"><script>${prelude(runId, linked, syntaxError)}</script>`;
  const tail = checks.length ? `<script>${checksScript(checks, files)}</script>` : '';

  if (/<head[^>]*>/i.test(html)) html = html.replace(/<head[^>]*>/i, (m) => m + head);
  else if (/<html[^>]*>/i.test(html)) html = html.replace(/<html[^>]*>/i, (m) => m + head);
  else html = head + html;

  if (/<\/body\s*>/i.test(html)) html = html.replace(/<\/body\s*>(?![\s\S]*<\/body)/i, tail + '</body>');
  else html += tail;

  // Tell the prelude which document line script.js starts on (for browsers that ignore sourceURL).
  const marker = html.indexOf('\n//# sourceURL=script.js');
  if (marker !== -1) {
    const scriptOpen = html.lastIndexOf('<script>', marker);
    const startLine = html.slice(0, scriptOpen).split('\n').length;
    html = html.replace('__JS_START__', String(startLine));
  } else {
    html = html.replace('__JS_START__', '0');
  }
  return { html, linked, syntaxError };
}

/**
 * Line offset: when a script has no sourceURL support, the browser reports
 * line numbers relative to the whole document. The prelude converts them
 * back using the script's position, found at runtime.
 */
function prelude(runId: string, linked: { css: boolean; js: boolean }, syntaxError: SyntaxProblem | null): string {
  return `(function(){
var RUN=${JSON.stringify(runId)};var count=0;var MAX=300;var JS_START=__JS_START__;
function send(m){m.__lab=true;m.run=RUN;try{parent.postMessage(m,'*');}catch(e){}}
window.__labSend=send;
function fmt(v,d){d=d||0;
 if(typeof v==='string')return d?JSON.stringify(v):v;
 if(v===undefined)return 'undefined';if(v===null)return 'null';
 if(typeof v==='function')return 'function '+(v.name||'(anonymous)')+'()';
 if(typeof v==='number'||typeof v==='boolean'||typeof v==='bigint')return String(v);
 if(typeof v==='symbol')return v.toString();
 if(v instanceof Error)return v.name+': '+v.message;
 if(typeof Element!=='undefined'&&v instanceof Element){return '<'+v.tagName.toLowerCase()+(v.id?' id="'+v.id+'"':'')+(v.className&&typeof v.className==='string'?' class="'+v.className+'"':'')+'>';}
 if(d>2)return Array.isArray(v)?'[…]':'{…}';
 try{if(Array.isArray(v))return '['+v.slice(0,50).map(function(x){return fmt(x,d+1)}).join(', ')+(v.length>50?', …':'')+']';
 var ks=Object.keys(v).slice(0,30);return '{ '+ks.map(function(k){return k+': '+fmt(v[k],d+1)}).join(', ')+(Object.keys(v).length>30?', …':'')+' }';}catch(e){return String(v);}}
window.__logs=[];
['log','info','warn','error'].forEach(function(level){console[level]=function(){var parts=[].slice.call(arguments);var text=parts.map(function(p){return fmt(p,0)}).join(' ');window.__logs.push(text);
 if(++count<=MAX)send({type:'console',level:level,text:text.slice(0,2000)});else if(count===MAX+1)send({type:'console',level:'warn',text:'Too many messages: only the first '+MAX+' are shown.'});};});
function lineOf(e){var stack=(e&&e.stack)||'';var m=stack.match(/script\\.js:(\\d+)(?::(\\d+))?/);return m?{line:+m[1],col:m[2]?+m[2]:null}:null;}
function report(err,msg,file,line,col){var pos=lineOf(err);
 if(!pos&&line){if(file&&/script\\.js$/.test(file))pos={line:line,col:col};else if(JS_START)pos={line:line-JS_START+1,col:col};}
 var name=err&&err.name||'Error';var message=err&&err.message||String(msg||'Unknown error').replace(/^Uncaught\\s+(\\w+:\\s*)?/,'');
 send({type:'error',name:name,message:message,line:pos?pos.line:null,col:pos?pos.col:null});}
window.addEventListener('error',function(e){report(e.error,e.message,e.filename,e.lineno,e.colno);});
window.addEventListener('unhandledrejection',function(e){var r=e.reason;report(r instanceof Error?r:{name:'Error',message:'A promise was rejected: '+fmt(r)},null);});
var t=null;window.__guard=function(){var now=Date.now();if(t===null){t=now;setTimeout(function(){t=null;},0);}else if(now-t>1000){t=null;var e=new Error('This loop ran for more than 1 second, so it was stopped.');e.name='InfiniteLoopError';throw e;}};
window.addEventListener('click',function(e){if(e.defaultPrevented)return;var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(a&&!/^#/.test(a.getAttribute('href'))){e.preventDefault();send({type:'console',level:'info',text:'Links don\\'t navigate inside the preview (you clicked one to '+a.getAttribute('href')+').'});}});
window.addEventListener('submit',function(e){if(e.defaultPrevented)return;e.preventDefault();send({type:'console',level:'info',text:'The form was submitted, but nothing handled it, so the page would have reloaded. Call event.preventDefault() in your submit handler. (In the preview, forms never send anything anywhere.)'});});
send({type:'ready',linked:${JSON.stringify(linked)}});
${syntaxError ? `send({type:'error',name:'SyntaxError',message:${JSON.stringify(syntaxError.message)},line:${syntaxError.line},col:${syntaxError.column}});` : ''}
})();`;
}

/** Runs the exercise's checks after the page loads and reports which passed. */
function checksScript(checks: CheckSpec[], files: LabFiles): string {
  const list = checks
    .map((c) => `{id:${JSON.stringify(c.id)},fn:async function(doc,logs,source){${escapeScript(c.test)}\n}}`)
    .join(',');
  return `(function(){var source=${escapeScript(JSON.stringify(files))};var checks=[${list}];
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
window.addEventListener('load',async function(){await wait(30);var results=[];
for(var i=0;i<checks.length;i++){var c=checks[i];try{var ok=await Promise.race([c.fn(document,window.__logs.slice(),source),wait(2000).then(function(){throw new Error('This check took too long')})]);results.push({id:c.id,passed:ok===true});}catch(e){results.push({id:c.id,passed:false,error:String(e&&e.message||e)});}}
window.__labSend({type:'checks',results:results});});})();`;
}
