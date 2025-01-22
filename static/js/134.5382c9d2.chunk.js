"use strict";(self.webpackChunkpfefront=self.webpackChunkpfefront||[]).push([[134],{83134:(e,t,o)=>{o.r(t),o.d(t,{default:()=>j});var a=o(89379),n=o(65043),r=o(87234),i=o(94496),s=o(7353),l=o(68903),c=o(12110),d=o(2828),u=o(26494),m=o(15795),p=o(42518),h=o(40794),A=o(14194),g=o(58602),f=o(16851),v=o(28400),x=o(73216),y=o(23849),C=o(70579);const j=()=>{const[e,t]=(0,n.useState)(null),[o,j]=(0,n.useState)(""),[b,w]=(0,n.useState)(""),[k,M]=(0,n.useState)({open:!1,message:"",severity:"success"}),N=(0,x.Zp)(),D=[{id:"kanban",name:"Kanban",description:"Visualize work and maximize efficiency with a kanban board",Icon:g.A},{id:"scrum",name:"Scrum",description:"Plan, prioritize, and schedule sprints using scrum framework",Icon:f.A},{id:"project",name:"Project Management",description:"Manage and track agile work plus integrate developer tools like GitHub",Icon:v.A}];return(0,C.jsxs)(r.A,{maxWidth:"lg",sx:{mt:4,mb:4},children:[(0,C.jsx)(i.A,{variant:"h4",gutterBottom:!0,children:"Choose a template"}),(0,C.jsx)(i.A,{variant:"subtitle1",color:"text.secondary",gutterBottom:!0,children:"Start with a template that fits your team's needs. You can customize it later."}),(0,C.jsx)(s.A,{sx:{mt:4},children:(0,C.jsx)(l.Ay,{container:!0,spacing:3,children:D.map((o=>{const a=o.Icon;return(0,C.jsx)(l.Ay,{item:!0,xs:12,md:4,children:(0,C.jsx)(c.A,{sx:{height:"100%",border:(null===e||void 0===e?void 0:e.id)===o.id?2:1,borderColor:(null===e||void 0===e?void 0:e.id)===o.id?"primary.main":"grey.300"},children:(0,C.jsx)(d.A,{onClick:()=>(e=>{t(e),w(e.description)})(o),sx:{height:"100%",p:2},children:(0,C.jsx)(u.A,{children:(0,C.jsxs)(s.A,{sx:{display:"flex",flexDirection:"column",alignItems:"center",gap:2},children:[(0,C.jsx)(a,{sx:{fontSize:40}}),(0,C.jsx)(i.A,{variant:"h6",component:"div",children:o.name}),(0,C.jsx)(i.A,{variant:"body2",color:"text.secondary",align:"center",children:o.description})]})})})})},o.id)}))})}),e&&(0,C.jsxs)(s.A,{sx:{mt:4},children:[(0,C.jsx)(i.A,{variant:"h6",gutterBottom:!0,children:"Template Details"}),(0,C.jsxs)(l.Ay,{container:!0,spacing:3,children:[(0,C.jsx)(l.Ay,{item:!0,xs:12,children:(0,C.jsx)(m.A,{required:!0,fullWidth:!0,label:"Template Name",value:o,onChange:e=>j(e.target.value)})}),(0,C.jsx)(l.Ay,{item:!0,xs:12,children:(0,C.jsx)(m.A,{fullWidth:!0,multiline:!0,rows:4,label:"Description",value:b,onChange:e=>w(e.target.value)})})]})]}),(0,C.jsxs)(s.A,{sx:{mt:4,display:"flex",justifyContent:"flex-end",gap:2},children:[(0,C.jsx)(p.A,{variant:"outlined",onClick:()=>N("/templates"),children:"Cancel"}),(0,C.jsx)(p.A,{variant:"contained",disabled:!e||!o.trim(),onClick:async()=>{if(e&&o.trim())try{const t=localStorage.getItem("userId");if(!t)return void M({open:!0,message:"User not authenticated. Please login again.",severity:"error"});const a={name:o,description:b||e.description,type:e.id,icon:"kanban"===e.id?"kanban":"scrum"===e.id?"speed":"project",features:[],defaultColumns:[{name:"To Do",order:1,wipLimit:0},{name:"In Progress",order:2,wipLimit:3},{name:"Done",order:3,wipLimit:0}],settings:{sprintDuration:2},createdBy:t};await y.A.create(a),M({open:!0,message:"Template created successfully",severity:"success"}),setTimeout((()=>{N("/templates")}),1500)}catch(n){var t,a;console.error("Error creating template:",n),M({open:!0,message:(null===(t=n.response)||void 0===t||null===(a=t.data)||void 0===a?void 0:a.message)||"Error creating template. Please try again.",severity:"error"})}else M({open:!0,message:"Please fill in all required fields",severity:"error"})},children:"Create Template"})]}),(0,C.jsx)(h.A,{open:k.open,autoHideDuration:6e3,onClose:()=>M((0,a.A)((0,a.A)({},k),{},{open:!1})),children:(0,C.jsx)(A.A,{onClose:()=>M((0,a.A)((0,a.A)({},k),{},{open:!1})),severity:k.severity,sx:{width:"100%"},children:k.message})})]})}},23849:(e,t,o)=>{o.d(t,{A:()=>n});var a=o(50214);const n={getAll:()=>(console.log("Fetching all templates..."),a.A.get("/template/all")),getTemplate:e=>(console.log("Fetching template with ID:",e),a.A.get("/template/".concat(e))),getTemplatesByType:e=>(console.log("Fetching templates by type:",e),a.A.get("/template/type/".concat(e))),getDefaultTemplates:()=>(console.log("Fetching default templates..."),a.A.get("/template/default")),create:e=>(console.log("Creating template with data:",e),a.A.post("/template/create",e)),update:(e,t)=>(console.log("Updating template with ID:",e),console.log("Update data:",t),a.A.put("/template/update/".concat(e),t)),delete:e=>(console.log("Deleting template with ID:",e),a.A.delete("/template/delete/".concat(e))),clone:e=>(console.log("Cloning template with ID:",e),a.A.post("/template/".concat(e,"/clone")))}},28400:(e,t,o)=>{o.d(t,{A:()=>r});var a=o(66734),n=o(70579);const r=(0,a.A)((0,n.jsx)("path",{d:"M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8z"}),"Folder")},2828:(e,t,o)=>{o.d(t,{A:()=>y});var a=o(89379),n=o(80045),r=o(65043),i=o(58387),s=o(98610),l=o(34535),c=o(56262),d=o(98206),u=o(92532),m=o(72372);function p(e){return(0,m.Ay)("MuiCardActionArea",e)}const h=(0,u.A)("MuiCardActionArea",["root","focusVisible","focusHighlight"]);var A=o(83424),g=o(70579);const f=["children","className","focusVisibleClassName"],v=(0,l.Ay)(A.A,{name:"MuiCardActionArea",slot:"Root",overridesResolver:(e,t)=>t.root})((0,c.A)((e=>{let{theme:t}=e;return{display:"block",textAlign:"inherit",borderRadius:"inherit",width:"100%",["&:hover .".concat(h.focusHighlight)]:{opacity:(t.vars||t).palette.action.hoverOpacity,"@media (hover: none)":{opacity:0}},["&.".concat(h.focusVisible," .").concat(h.focusHighlight)]:{opacity:(t.vars||t).palette.action.focusOpacity}}}))),x=(0,l.Ay)("span",{name:"MuiCardActionArea",slot:"FocusHighlight",overridesResolver:(e,t)=>t.focusHighlight})((0,c.A)((e=>{let{theme:t}=e;return{overflow:"hidden",pointerEvents:"none",position:"absolute",top:0,right:0,bottom:0,left:0,borderRadius:"inherit",opacity:0,backgroundColor:"currentcolor",transition:t.transitions.create("opacity",{duration:t.transitions.duration.short})}}))),y=r.forwardRef((function(e,t){const o=(0,d.b)({props:e,name:"MuiCardActionArea"}),{children:r,className:l,focusVisibleClassName:c}=o,u=(0,n.A)(o,f),m=o,h=(e=>{const{classes:t}=e;return(0,s.A)({root:["root"],focusHighlight:["focusHighlight"]},p,t)})(m);return(0,g.jsxs)(v,(0,a.A)((0,a.A)({className:(0,i.A)(h.root,l),focusVisibleClassName:(0,i.A)(c,h.focusVisible),ref:t,ownerState:m},u),{},{children:[r,(0,g.jsx)(x,{className:h.focusHighlight,ownerState:m})]}))}))},26494:(e,t,o)=>{o.d(t,{A:()=>g});var a=o(89379),n=o(80045),r=o(65043),i=o(58387),s=o(98610),l=o(34535),c=o(98206),d=o(92532),u=o(72372);function m(e){return(0,u.Ay)("MuiCardContent",e)}(0,d.A)("MuiCardContent",["root"]);var p=o(70579);const h=["className","component"],A=(0,l.Ay)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(e,t)=>t.root})({padding:16,"&:last-child":{paddingBottom:24}}),g=r.forwardRef((function(e,t){const o=(0,c.b)({props:e,name:"MuiCardContent"}),{className:r,component:l="div"}=o,d=(0,n.A)(o,h),u=(0,a.A)((0,a.A)({},o),{},{component:l}),g=(e=>{const{classes:t}=e;return(0,s.A)({root:["root"]},m,t)})(u);return(0,p.jsx)(A,(0,a.A)({as:l,className:(0,i.A)(g.root,r),ownerState:u,ref:t},d))}))},12110:(e,t,o)=>{o.d(t,{A:()=>f});var a=o(89379),n=o(80045),r=o(65043),i=o(58387),s=o(98610),l=o(34535),c=o(98206),d=o(61596),u=o(92532),m=o(72372);function p(e){return(0,m.Ay)("MuiCard",e)}(0,u.A)("MuiCard",["root"]);var h=o(70579);const A=["className","raised"],g=(0,l.Ay)(d.A,{name:"MuiCard",slot:"Root",overridesResolver:(e,t)=>t.root})({overflow:"hidden"}),f=r.forwardRef((function(e,t){const o=(0,c.b)({props:e,name:"MuiCard"}),{className:r,raised:l=!1}=o,d=(0,n.A)(o,A),u=(0,a.A)((0,a.A)({},o),{},{raised:l}),m=(e=>{const{classes:t}=e;return(0,s.A)({root:["root"]},p,t)})(u);return(0,h.jsx)(g,(0,a.A)({className:(0,i.A)(m.root,r),elevation:l?8:void 0,ref:t,ownerState:u},d))}))}}]);
//# sourceMappingURL=134.5382c9d2.chunk.js.map