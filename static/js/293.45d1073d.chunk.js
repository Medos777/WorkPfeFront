(self.webpackChunkpfefront=self.webpackChunkpfefront||[]).push([[293],{7293:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>L});var o=n(65043),a=n(7353),r=n(81637),s=n(14194),i=n(94496),c=n(18483),l=n(17392),d=n(68903),u=n(12110),p=n(26494),f=n(39336),A=n(43845),m=n(27600),v=n(42518),h=n(90035),g=n(4219),x=n(35316),j=n(15795),y=n(29347),b=n(70141),w=n(83560),k=n(51387),C=n(66734),S=n(70579);const R=(0,C.A)((0,S.jsx)("path",{d:"M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7zm-6 .67 2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"}),"SaveAlt");var M=n(28016),B=n(40293),E=n(72450),N=n(14512);const L=()=>{const[e,t]=(0,o.useState)([]),[n,C]=(0,o.useState)([]),[L,T]=(0,o.useState)(!0),[I,U]=(0,o.useState)(null),[_,H]=(0,o.useState)(!1),[O,P]=(0,o.useState)(null),[D,F]=(0,o.useState)(""),[W,q]=(0,o.useState)(!1);(0,o.useEffect)((()=>{z()}),[]);const z=async()=>{try{T(!0);const[e,n]=await Promise.all([M.A.getAll(),B.A.getAll()]);t(e.data||[]),C(n.data||[])}catch(e){U("Failed to fetch backlogs. Please try again later.")}finally{T(!1)}};if(L)return(0,S.jsx)(a.A,{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",children:(0,S.jsx)(r.A,{})});if(I)return(0,S.jsx)(a.A,{p:3,children:(0,S.jsx)(s.A,{severity:"error",children:I})});const V=()=>q(!1);return L?(0,S.jsx)(a.A,{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",children:(0,S.jsx)(r.A,{})}):I?(0,S.jsx)(a.A,{p:3,children:(0,S.jsx)(s.A,{severity:"error",children:I})}):(0,S.jsxs)(a.A,{sx:{p:3},children:[(0,S.jsxs)(a.A,{display:"flex",justifyContent:"space-between",alignItems:"center",mb:2,children:[(0,S.jsx)(i.A,{variant:"h4",gutterBottom:!0,children:"Backlogs"}),(0,S.jsx)(c.A,{title:"Add New Backlog",children:(0,S.jsx)(l.A,{color:"primary",onClick:()=>q(!0),children:(0,S.jsx)(b.A,{})})})]}),(0,S.jsx)(d.Ay,{container:!0,spacing:3,children:e.length>0?e.map((e=>{var t;return(0,S.jsx)(d.Ay,{item:!0,xs:12,sm:6,md:4,children:(0,S.jsxs)(u.A,{sx:{borderRadius:2,boxShadow:3},children:[(0,S.jsxs)(p.A,{children:[(0,S.jsx)(i.A,{variant:"h6",gutterBottom:!0,children:e.name}),(0,S.jsxs)(i.A,{variant:"body2",color:"textSecondary",children:["Project: ",(null===(t=e.project)||void 0===t?void 0:t.projectName)||"No Project"]}),(0,S.jsx)(f.A,{sx:{my:2}}),(0,S.jsx)(i.A,{variant:"subtitle2",gutterBottom:!0,children:"Items:"}),e.items.length>0?e.items.map((e=>{const t=n.find((t=>t._id===e));return(0,S.jsx)(A.A,{label:(null===t||void 0===t?void 0:t.title)||"Unknown",sx:{mr:.5,mb:.5},color:"primary"},e)})):(0,S.jsx)(i.A,{variant:"body2",color:"textSecondary",children:"No items in this backlog."})]}),(0,S.jsxs)(m.A,{children:[(0,S.jsx)(c.A,{title:"Edit Backlog",children:(0,S.jsx)(l.A,{onClick:()=>(e=>{P(e),F(e.name),H(!0)})(e),children:(0,S.jsx)(w.A,{})})}),(0,S.jsx)(c.A,{title:"Delete Backlog",children:(0,S.jsx)(l.A,{color:"error",onClick:()=>(async e=>{try{await M.A.deleteacklog(e),z()}catch(t){U("Failed to delete backlog. Please try again.")}})(e._id),children:(0,S.jsx)(k.A,{})})}),(0,S.jsx)(c.A,{title:"Export as CSV",children:(0,S.jsx)(v.A,{variant:"outlined",startIcon:(0,S.jsx)(R,{}),onClick:()=>(e=>{const t=e.items.map((t=>{const o=n.find((e=>e._id===t));return o?"".concat(e.name,",").concat(e.project.projectName,",").concat(o.title,",").concat(o.description,",").concat(o.type,",").concat(o.status):null})).filter(Boolean).join("\n"),o=new Blob(["Backlog Name,Project,Item Title,Item Description,Item Type,Item Status\n"+t],{type:"text/csv;charset=utf-8;"});(0,E.saveAs)(o,"".concat(e.name.replace(/\s+/g,"_"),"_backlog.csv"))})(e),children:"Export"})})]})]})},e._id)})):(0,S.jsx)(i.A,{variant:"body2",color:"textSecondary",children:"No backlogs found."})}),(0,S.jsx)(h.A,{open:W,onClose:V,maxWidth:"sm",fullWidth:!0,children:(0,S.jsx)(N.default,{open:W,onClose:V,onBacklogCreated:()=>{z(),V()}})}),(0,S.jsxs)(h.A,{open:_,onClose:()=>H(!1),children:[(0,S.jsx)(g.A,{children:"Edit Backlog"}),(0,S.jsx)(x.A,{children:(0,S.jsx)(j.A,{label:"Backlog Name",value:D,onChange:e=>F(e.target.value),fullWidth:!0,margin:"normal"})}),(0,S.jsxs)(y.A,{children:[(0,S.jsx)(v.A,{onClick:()=>H(!1),children:"Cancel"}),(0,S.jsx)(v.A,{variant:"contained",onClick:async()=>{try{await M.A.update(O._id,{name:D}),H(!1),z()}catch(e){U("Failed to update backlog. Please try again.")}},color:"primary",children:"Save"})]})]})]})}},27600:(e,t,n)=>{"use strict";n.d(t,{A:()=>v});var o=n(89379),a=n(80045),r=n(65043),s=n(58387),i=n(98610),c=n(34535),l=n(98206),d=n(92532),u=n(72372);function p(e){return(0,u.Ay)("MuiCardActions",e)}(0,d.A)("MuiCardActions",["root","spacing"]);var f=n(70579);const A=["disableSpacing","className"],m=(0,c.Ay)("div",{name:"MuiCardActions",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:n}=e;return[t.root,!n.disableSpacing&&t.spacing]}})({display:"flex",alignItems:"center",padding:8,variants:[{props:{disableSpacing:!1},style:{"& > :not(style) ~ :not(style)":{marginLeft:8}}}]}),v=r.forwardRef((function(e,t){const n=(0,l.b)({props:e,name:"MuiCardActions"}),{disableSpacing:r=!1,className:c}=n,d=(0,a.A)(n,A),u=(0,o.A)((0,o.A)({},n),{},{disableSpacing:r}),v=(e=>{const{classes:t,disableSpacing:n}=e,o={root:["root",!n&&"spacing"]};return(0,i.A)(o,p,t)})(u);return(0,f.jsx)(m,(0,o.A)({className:(0,s.A)(v.root,c),ownerState:u,ref:t},d))}))},26494:(e,t,n)=>{"use strict";n.d(t,{A:()=>v});var o=n(89379),a=n(80045),r=n(65043),s=n(58387),i=n(98610),c=n(34535),l=n(98206),d=n(92532),u=n(72372);function p(e){return(0,u.Ay)("MuiCardContent",e)}(0,d.A)("MuiCardContent",["root"]);var f=n(70579);const A=["className","component"],m=(0,c.Ay)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(e,t)=>t.root})({padding:16,"&:last-child":{paddingBottom:24}}),v=r.forwardRef((function(e,t){const n=(0,l.b)({props:e,name:"MuiCardContent"}),{className:r,component:c="div"}=n,d=(0,a.A)(n,A),u=(0,o.A)((0,o.A)({},n),{},{component:c}),v=(e=>{const{classes:t}=e;return(0,i.A)({root:["root"]},p,t)})(u);return(0,f.jsx)(m,(0,o.A)({as:c,className:(0,s.A)(v.root,r),ownerState:u,ref:t},d))}))},12110:(e,t,n)=>{"use strict";n.d(t,{A:()=>h});var o=n(89379),a=n(80045),r=n(65043),s=n(58387),i=n(98610),c=n(34535),l=n(98206),d=n(61596),u=n(92532),p=n(72372);function f(e){return(0,p.Ay)("MuiCard",e)}(0,u.A)("MuiCard",["root"]);var A=n(70579);const m=["className","raised"],v=(0,c.Ay)(d.A,{name:"MuiCard",slot:"Root",overridesResolver:(e,t)=>t.root})({overflow:"hidden"}),h=r.forwardRef((function(e,t){const n=(0,l.b)({props:e,name:"MuiCard"}),{className:r,raised:c=!1}=n,d=(0,a.A)(n,m),u=(0,o.A)((0,o.A)({},n),{},{raised:c}),p=(e=>{const{classes:t}=e;return(0,i.A)({root:["root"]},f,t)})(u);return(0,A.jsx)(v,(0,o.A)({className:(0,s.A)(p.root,r),elevation:c?8:void 0,ref:t,ownerState:u},d))}))},72450:function(e,t,n){var o,a,r;a=[],void 0===(r="function"===typeof(o=function(){"use strict";function t(e,t){return"undefined"==typeof t?t={autoBom:!1}:"object"!=typeof t&&(console.warn("Deprecated: Expected third argument to be a object"),t={autoBom:!t}),t.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)?new Blob(["\ufeff",e],{type:e.type}):e}function o(e,t,n){var o=new XMLHttpRequest;o.open("GET",e),o.responseType="blob",o.onload=function(){c(o.response,t,n)},o.onerror=function(){console.error("could not download file")},o.send()}function a(e){var t=new XMLHttpRequest;t.open("HEAD",e,!1);try{t.send()}catch(e){}return 200<=t.status&&299>=t.status}function r(e){try{e.dispatchEvent(new MouseEvent("click"))}catch(o){var t=document.createEvent("MouseEvents");t.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),e.dispatchEvent(t)}}var s="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof n.g&&n.g.global===n.g?n.g:void 0,i=s.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),c=s.saveAs||("object"!=typeof window||window!==s?function(){}:"download"in HTMLAnchorElement.prototype&&!i?function(e,t,n){var i=s.URL||s.webkitURL,c=document.createElement("a");t=t||e.name||"download",c.download=t,c.rel="noopener","string"==typeof e?(c.href=e,c.origin===location.origin?r(c):a(c.href)?o(e,t,n):r(c,c.target="_blank")):(c.href=i.createObjectURL(e),setTimeout((function(){i.revokeObjectURL(c.href)}),4e4),setTimeout((function(){r(c)}),0))}:"msSaveOrOpenBlob"in navigator?function(e,n,s){if(n=n||e.name||"download","string"!=typeof e)navigator.msSaveOrOpenBlob(t(e,s),n);else if(a(e))o(e,n,s);else{var i=document.createElement("a");i.href=e,i.target="_blank",setTimeout((function(){r(i)}))}}:function(e,t,n,a){if((a=a||open("","_blank"))&&(a.document.title=a.document.body.innerText="downloading..."),"string"==typeof e)return o(e,t,n);var r="application/octet-stream"===e.type,c=/constructor/i.test(s.HTMLElement)||s.safari,l=/CriOS\/[\d]+/.test(navigator.userAgent);if((l||r&&c||i)&&"undefined"!=typeof FileReader){var d=new FileReader;d.onloadend=function(){var e=d.result;e=l?e:e.replace(/^data:[^;]*;/,"data:attachment/file;"),a?a.location.href=e:location=e,a=null},d.readAsDataURL(e)}else{var u=s.URL||s.webkitURL,p=u.createObjectURL(e);a?a.location=p:location.href=p,a=null,setTimeout((function(){u.revokeObjectURL(p)}),4e4)}});s.saveAs=c.saveAs=c,e.exports=c})?o.apply(t,a):o)||(e.exports=r)}}]);
//# sourceMappingURL=293.45d1073d.chunk.js.map