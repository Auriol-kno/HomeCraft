import assert from 'node:assert/strict';
import {parseCustomThemes} from '../app/src/custom-theme.ts';
const valid=JSON.stringify({v:1,active:'user-a',themes:[{id:'user-a',name:'Mój karmel',button:'#a84f2a',accent:'#336699'}]});
assert.deepEqual(parseCustomThemes(valid),{v:1,active:'user-a',themes:[{id:'user-a',name:'Mój karmel',button:'#a84f2a',accent:'#336699'}]});
for(const raw of [null,'{','null','[]','{"v":2,"themes":[]}','{"v":1,"themes":"x"}'])assert.deepEqual(parseCustomThemes(raw),{v:1,active:null,themes:[]});
const dirty=JSON.stringify({v:1,active:'bad',themes:[{id:'bad',name:'',button:'#123456',accent:'#123456'},{id:'ok',name:' OK ',button:'#ABCDEF',accent:'#123456'},{id:'ok',name:'duplikat',button:'#000000',accent:'#ffffff'},{id:'evil<script>',name:'x',button:'#000000',accent:'#ffffff'}]});
assert.deepEqual(parseCustomThemes(dirty),{v:1,active:null,themes:[{id:'ok',name:'OK',button:'#abcdef',accent:'#123456'}]});
console.log('PASS: custom theme storage validation and colour normalization');
