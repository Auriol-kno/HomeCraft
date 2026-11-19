import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanName, addCoffee, bestEntry, summarize, validStore, validPhoto, recent } from '../app/src/coffees.ts';

const store=()=>({list:[],current:null});
test('names are cleaned and deduplicated case-insensitively', () => {
 const s=store();
 const a=addCoffee(s,'  Hayb   Brazylia <b> ',1);
 assert.equal(a.name,'Hayb Brazylia b');
 const b=addCoffee(s,'hayb brazylia b',2);
 assert.equal(b.id,a.id); assert.equal(s.list.length,1); assert.equal(b.last,2);
 assert.equal(addCoffee(s,'   ',3),null);
 assert.equal(cleanName('x'.repeat(80)).length,60);
});
test('recent orders by last use', () => {
 const s=store();addCoffee(s,'A',1);addCoffee(s,'B',2);addCoffee(s,'A',3);
 assert.deepEqual(recent(s).map(c=>c.name),['A','B']);
});
test('best entry: most stars, then newest, per coffee and method', () => {
 const h=[{ts:3,method:'espresso',coffee:'x',stars:4},{ts:2,method:'espresso',coffee:'x',stars:5},{ts:1,method:'espresso',coffee:'x',stars:5},{ts:4,method:'v60',coffee:'x',stars:5},{ts:5,method:'espresso',coffee:'y',stars:5}];
 assert.equal(bestEntry(h,'x','espresso'),1);
 assert.equal(bestEntry(h,'x','moka'),-1);
 const s=summarize(h,'x');
 assert.equal(s.count,4); assert.equal(s.methods[0].method,'espresso'); assert.equal(s.methods[0].count,3);
 assert.ok(Math.abs(s.methods[0].avg-14/3)<1e-9); assert.equal(s.methods[1].best,3);
});
test('store and photo validation rejects markup and foreign data', () => {
 assert.ok(validStore({list:[{id:'c1',name:'Hayb',ts:1,last:1}],current:'c1'}));
 assert.ok(!validStore({list:[{id:'c1',name:'<img onerror>',ts:1,last:1}],current:null}));
 assert.ok(!validStore({list:[{id:'a b',name:'x',ts:1,last:1}],current:null}));
 assert.ok(validPhoto('data:image/jpeg;base64,AAAA'));
 assert.ok(!validPhoto('data:image/svg+xml;base64,AAAA'));
 assert.ok(!validPhoto('javascript:alert(1)'));
});
