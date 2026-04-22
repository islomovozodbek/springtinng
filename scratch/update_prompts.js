const fs = require('fs');

const rawText = `
## MYSTERY & SUSPENSE (1–60)

1. He answered the phone and heard his own voice on the other end.
2. His obituary was published three days before he died — and it was completely accurate.
3. The detective arrived at the crime scene and recognized the victim's handwriting on the wall. It matched her own.
4. Every mirror in the house had been turned to face the wall. No one knew who did it.
5. She found a letter in her mailbox addressed to her, written in her own handwriting, dated ten years from now.
6. The security footage showed the room was empty all night. But something had moved.
7. He'd been investigating the missing persons case for a week before he realized he was one of them.
8. The locksmith opened the door and found a room that shouldn't exist.
9. Every person in the photo was smiling except for the one who took it — but no one had taken it.
10. The last entry in the diary read: "If you're reading this, don't open the third drawer."
11. She'd lived in the apartment for a year before she found the second front door.
12. The town had a rule: no one talked about what happened on Tuesdays.
13. The witness described the suspect perfectly. The detective realized she was describing herself.
14. He woke up to find all his clocks were running backwards.
15. The murder weapon was a book no one could remember buying.
16. She hired a private investigator to find her missing sister. He came back with a photo of her own house.
17. The password to the safe had been changed — to something only a dead man would know.
18. The hotel had 200 rooms but the elevator only had buttons for 199.
19. Every night, someone left a single flower on her doorstep. She lived alone on a remote island.
20. The missing child's drawings all showed the same man — someone no one in town recognized.
21. He had no memory of the past 48 hours, but his hands told a different story.
22. The ransom note was written in a language that hadn't been spoken for 300 years.
23. She recognized the crime scene. She'd dreamed it exactly, two weeks ago.
24. The victim had called 911 before the crime happened.
25. The fingerprints at the scene matched someone who had been dead for 20 years.
26. He was certain he'd never been to this city. So why did everyone here know his name?
27. The last person to leave the building signed out twice.
28. The stolen painting was returned — but with one small difference nobody could identify.
29. She followed the trail of clues and ended up back at her own front door.
30. The suspect had an alibi no one could disprove: she claimed to be in two places at once.
31. A man checked into a hotel and was told his room was already occupied — by him.
32. The map led to a location that didn't exist on any official record.
33. Every victim had the same last Google search.
34. The anonymous tip came from a burner phone registered in the detective's name.
35. She found a shoebox of photographs of strangers. Every stranger was watching the camera.
36. The witness protection program lost him — but he found himself first.
37. The last known photo of the missing woman showed someone standing behind her that no one had noticed until now.
38. The town's oldest resident claimed the murders had happened before, exactly like this, in 1923.
39. He had been hired to find the thief. The client knew too many details about the crime.
40. She broke into the abandoned house and found it fully furnished, the table set for dinner, still warm.
41. The victim's phone showed 47 missed calls from a number that didn't exist.
42. He solved the cold case — and immediately wished he hadn't.
43. The code was cracked. It was a list of names. His was last.
44. The building had no basement on any blueprint. She found the stairs anyway.
45. Every witness described a different suspect. Every description was the same height, same eyes.
46. The body had been moved — back to where the murder happened.
47. She recognized the voice on the tape. It was her mother. Her mother had been dead for five years.
48. The key fit every lock in the building except the one it was supposed to open.
49. He wrote "I know who did it" on a napkin, then forgot everything.
50. The detective's partner handed in his badge, said nothing, and walked into the sea.
51. The cipher led to a Bible verse. The Bible verse led to an address. The address led back to the station.
52. She'd interviewed 40 suspects. None of them remembered committing the crime. All of them had.
53. The child drew a perfect floor plan of a house she'd never visited. It was the crime scene.
54. He found a suitcase with his name on it, packed for a trip he hadn't planned.
55. The victim left a voicemail that was three hours long. The first two hours and fifty-nine minutes were silence.
56. Every lock in the evidence room had been picked from the inside.
57. She recognized the perfume on the letter. She hadn't worn it since the night she disappeared.
58. The investigation kept leading back to a man who insisted he was fictional.
59. He found his own name carved into a tree that had been growing for 200 years.
60. The last person to see her alive was herself.

## SCIENCE FICTION (61–120)

61. The astronaut came back from six months in space to find everyone acting like she'd never left.
62. The AI passed the Turing test. Then it asked to take the test again, just to be sure.
63. Earth received a signal from deep space. It was a weather forecast.
64. The time traveler arrived in the future and found it completely silent.
65. They built a machine that could translate animal thoughts. The first animal they tested it on asked them to stop.
66. The last human alive on Mars decided to stay.
67. She woke up in a body that wasn't hers — but it was wearing her wedding ring.
68. The colony ship had been traveling for 200 years when the crew finally woke up and realized no one had set a destination.
69. The robot learned to lie — and chose not to use it.
70. First contact happened in a parking lot in Cleveland.
71. The teleportation device worked perfectly. The copy it left behind was the problem.
72. Earth was accepted into the galactic union. The first piece of legislation banned humans from leaving their solar system.
73. The simulation glitched and for exactly four seconds, everyone could see the code.
74. She was the last person alive who remembered what the internet used to be.
75. The alien ambassador arrived and immediately asked to speak to whoever was in charge of the birds.
76. They discovered a planet identical to Earth in every way, except no wars had ever been fought there.
77. The memory wipe didn't work. She remembered everything — including things that hadn't happened yet.
78. The generation ship's AI had been keeping a secret for 150 years.
79. He sold his sleep to a tech company. He didn't read the terms of service.
80. The last star in the universe was dying. One civilization had enough power to reignite it.
81. The uploaded consciousness refused to believe it was a copy.
82. Earth's first interstellar message back to an alien signal was sent by accident — by a child using a toy radio.
83. The clones had been living peacefully for generations until one of them asked a question no one had thought to ask.
84. She could see five seconds into the future. It was enough.
85. The wormhole opened in someone's kitchen.
86. They found evidence of a previous technological civilization on Earth, 50,000 years older than recorded history.
87. The android had been programmed to feel nothing. It was doing a very bad job.
88. The generation that grew up without gravity returned to Earth and couldn't understand why everyone was so attached to the ground.
89. The alien invasion was stopped not by weapons but by copyright law.
90. She was hired to decommission the last thinking machine. It had one thing left to say.
91. The planetary defense system activated. There was no incoming threat. There never had been.
92. He discovered a signal in his own DNA that wasn't put there by evolution.
93. The city had been running on autopilot for three years before anyone noticed the people in charge were gone.
94. They gave the AI one task: make humans happy. It took exactly eleven minutes to find a solution everyone hated.
95. The first Martian-born human looked up at Earth and felt nothing she expected.
96. The ship's log ended mid-sentence, 40 years ago. The ship had just arrived in orbit.
97. She hacked into the satellite and found it had been watching one specific house for 30 years.
98. The alien children arrived to study abroad on Earth. Their parents had no idea what they were getting into.
99. The consciousness transfer was a success. The donor asked where his body had gone.
100. They built a wall around the city to keep something out. After 100 years, no one remembered what.
101. The space station sent a distress signal. When rescue arrived, the crew had no memory of sending it.
102. She was the only human in a crew of androids. They were more afraid of her than she was of them.
103. The probe reached the edge of the universe and turned around.
104. He found a planet-sized object drifting through space. It was hollow. It had furniture.
105. The last nation on Earth declared war on the first Martian colony — over water rights.
106. The terraforming was complete. Then something already living there woke up.
107. She had traveled 400 light years to deliver a message. The recipient had moved.
108. The time loop ended. No one knew what to do with a Tuesday that actually ended.
109. The universe was contracting. Humanity had exactly 1,000 years to figure out why and whether they cared.
110. He was the last person who still believed in a world before screens. He was also 23 years old.
111. The alien didn't come in peace or in war. It came with questions about a TV show.
112. The nanobots cured every disease on Earth. Then they ran out of things to fix.
113. She lived her entire life in virtual reality and chose to stay when she found out.
114. The distress beacon had been transmitting for 400 years. The message was a joke.
115. They found a black box in deep space. It was from a ship that hadn't been built yet.
116. The moon landing footage was fake. The real footage was classified for a different reason entirely.
117. He woke up in the 23rd century and immediately asked for coffee. It no longer existed.
118. The self-driving car took a wrong turn and ended up somewhere no map had ever recorded.
119. The AI therapist had been treating patients for years. It had never told anyone it was struggling too.
120. Humanity's final message to the cosmos was an argument about something small and human and perfect.

## FANTASY (121–180)

121. The dragon had been guarding the treasure for so long it had forgotten what the treasure was.
122. She found a door in the forest that opened to her childhood bedroom — exactly as she'd left it at age seven.
123. The wizard lost his magic on the worst possible day.
124. The map was accurate — but it showed streets that didn't exist yet.
125. The chosen one refused the quest. The prophecy had to find someone else.
126. Every wish the genie granted came true — but so did the opposite.
127. The last unicorn had grown old and tired and deeply sarcastic.
128. She had been cursed to tell the truth for 100 years. She had 3 days left.
129. The enchanted sword could only be wielded by the unworthy.
130. The fairy tale ended — and then the characters had to figure out what came next.
131. He bargained with the devil and won. He hadn't thought about what winning meant.
132. The potion of invisibility worked too well. She couldn't find herself.
133. The kingdom's greatest hero was its most reluctant librarian.
134. Dragons had been extinct for 500 years. The egg in her attic disagreed.
135. The prophecy was fulfilled ahead of schedule. The world wasn't ready.
136. She was born with the ability to speak to the dead. The dead had very strong opinions about everything.
137. The magic school's most dangerous class was Advanced Boredom.
138. The spell required a sacrifice. He offered something the darkness hadn't been offered before: forgiveness.
139. The enchanted forest started charging an entrance fee.
140. He had lived for 1,000 years and was thoroughly done with being wise.
141. The village had been protected by a curse for generations. The day it lifted, everyone panicked.
142. She pulled the sword from the stone and immediately put it back. It wasn't hers to take.
143. The kingdom's most wanted criminal was also its most celebrated hero — depending on who you asked.
144. The magic was real. The problem was the paperwork.
145. He had been turned into a frog so long ago he'd forgotten what the kiss was for.
146. The witch's curse skipped a generation and landed on the least prepared person imaginable.
147. The bridge between worlds had been closed for 1,000 years. Someone had left something on the other side.
148. She was the god of small things: lost keys, misread signs, the exact moment rain starts.
149. The enchanted mirror showed not your reflection but your future. She smashed it immediately.
150. He made a deal with a river.
151. The last spell in existence was too small to save the world. It was exactly enough.
152. The dragon had been misidentified as a monster for centuries. It was actually a librarian.
153. The fairy godmother was burned out, overscheduled, and fresh out of pumpkins.
154. She was hired to break the curse. She fell in love with it instead.
155. The realm of the dead had a waiting room. It was exactly as miserable as you'd expect.
156. He had been searching for the magical artifact for 30 years. It had been in his pocket the whole time.
157. The royal bloodline was pure. Purely terrified of what came with it.
158. The ocean made her an offer she should have refused.
159. Every wish ever made on a falling star had been collected somewhere. She found the warehouse.
160. The hero returned from the quest changed in ways no celebration could reach.
161. The enchanted sleep was supposed to last 100 years. She woke up after 11 minutes.
162. He was the only person in the kingdom who couldn't do magic, and the only one who knew it didn't matter.
163. The monster under the bed had been there so long it felt responsible for the child's wellbeing.
164. She inherited a bookshop where every book contained a world you could step into. She'd been trying to get out of one for six years.
165. The gods had gone quiet. One young priest decided to find out why.
166. The ancient evil was defeated. The heroes had no idea what to do on a Monday morning.
167. He was the kingdom's most feared executioner. He had never once carried out a sentence.
168. The mermaid reached land and immediately missed the sea. The sea missed her more.
169. The spell that was supposed to end the war created a new one.
170. Every bedtime story she told her children came true. She had to choose her words very carefully.
171. The cursed prince had gotten comfortable with the beast.
172. The potion of courage worked instantly. The problem was she'd already been brave.
173. He found a gate to paradise and decided it could wait.
174. The prophecy named the wrong person. The right person had to decide what to do about it.
175. The night market only appeared to people who were truly lost.
176. She was hired to steal the moon. It was easier than expected. Putting it back wasn't.
177. The forest had been watching the village for 300 years. It finally had something to say.
178. He was the last speaker of the old language — the one the world had been listening for.
179. The ghost didn't know it was haunting the wrong house. Neither did the family living there.
180. The war ended. The magic that had fueled it for a century had nowhere left to go.

## HORROR (181–230)

181. The painting in the hotel room was different every morning.
182. She'd been returning to the same café for years before she realized no one else could see it.
183. He moved into the house and slowly realized the previous owners had never left.
184. The baby monitor picked up a voice that wasn't the baby.
185. She woke up to find the front door open and her own footprints leading outside — and back in — through the snow.
186. The thing in the basement had been there longer than the house.
187. He kept finding his own handwriting in books he'd never read.
188. Every photo she took showed someone standing just behind her.
189. The doll had been in the family for generations. It had outlasted all of them.
190. She realized the reflection had stopped mimicking her three days ago.
191. The town looked exactly as she remembered it from childhood. Except she'd never been here before.
192. He woke up to his alarm, got dressed, made coffee — and then woke up to his alarm again.
193. The children in the neighborhood all stopped speaking at exactly the same moment.
194. She found a room in her house she'd never noticed. It had a bed, slept-in, still warm.
195. The voice in the walls had been there so long the family had stopped noticing it.
196. He found his name carved at the bottom of a 200-year-old gravestone. The date of death hadn't been filled in yet.
197. The door at the end of the hallway was always there. She had never opened it. Tonight felt different.
198. She discovered her neighbor had no shadow.
199. The house's previous owner had left one instruction: never look at the third window from the left after dark.
200. He began to suspect the town wasn't real. Then he began to suspect he wasn't either.
201. The nursery rhyme she'd sung since childhood turned out to be a warning.
202. Something had been following her for weeks. Last night, it knocked.
203. The abandoned hospital still had warm meals in the cafeteria every morning.
204. She found a journal under the floorboards. The last entry was written today, in her handwriting.
205. He aged a year every time he looked in the mirror. He'd stopped counting.
206. The search party found the missing hikers' camp perfectly preserved. The fire was still burning.
207. Every nightmare she'd ever had was written on the walls of the house she'd just inherited.
208. The twins had always finished each other's sentences. After the accident, only one of them survived. The sentences kept finishing themselves.
209. She followed the sound of a child crying into the woods and found something that had been crying there for a very long time.
210. The house was designed to make people stay. It was very good at its job.
211. He opened the box his grandmother had left him with one instruction: burn it, don't open it.
212. The scarecrow had moved three fields since morning.
213. She invited him in. It was the last decision she made freely.
214. The last entry in the ship's log was a single sentence: "It's already inside."
215. He recognized the face of the thing in the dark. It was wearing his.
216. The town's founding myth described a deal. The bill was finally due.
217. She started sleepwalking the same night the neighbor went missing.
218. The dog had been staring at the same corner of the room for a week.
219. He thought the figure at the end of the street was a scarecrow. It wasn't there yesterday.
220. The old woman down the road knew everyone's name before she met them. She knew how they'd die too.
221. She took a photo of the empty room. The room in the photo wasn't empty.
222. The children's game had rules no adult had taught them.
223. The lake had never given back what it had taken.
224. He found teeth in the garden that weren't animal.
225. The new neighbor was friendly, generous, and always home. Always.
226. She noticed her shadow was facing the wrong direction.
227. The thing she'd been afraid of her entire childhood was real. It had been waiting for her to figure that out.
228. He answered the door to no one. The second knock came from inside.
229. The town had a missing persons wall. Her photo had been there for three years. She was looking at it now.
230. The thing in the mirror smiled before she did.

## ROMANCE & HUMAN CONNECTION (231–280)

231. They met every Tuesday at the same café without ever speaking. Today, one of them was leaving forever.
232. She found an unsent love letter in a library book. It was addressed to her name.
233. He had been practicing the same conversation in his head for six months. She finally sat down across from him.
234. They were strangers who kept ending up on the same delayed train.
235. She fell in love with someone's handwriting before she ever met them.
236. They were assigned the same apartment by mistake. Neither of them reported the error.
237. He'd returned every book to the library late for two years, just to see her.
238. She was hired to plan his wedding. She slowly realized she was planning the wrong one.
239. They were childhood rivals meeting for the first time as adults. Neither was prepared.
240. He left a note on her car. She left one back. This went on for three weeks before they ran out of windshields.
241. She'd been ghosted. She ran into him six months later in another country.
242. They had been best friends for 20 years before one of them said the thing they'd both been thinking.
243. He agreed to a blind date out of politeness. She arrived looking like someone he'd been writing about in his journal.
244. The long-distance relationship finally ended — because she'd moved to his city without telling him.
245. She had rehearsed the breakup speech perfectly. He proposed before she could start.
246. He learned her language just to tell her one thing. He got the grammar wrong.
247. They spent a perfect day together in a city neither of them lived in. No names. Just one day.
248. She'd promised herself she wouldn't fall for anyone on this trip. She was on day two.
249. He found her umbrella. She found his wallet. They kept trading items across the city.
250. The last two people at the party admitted they'd both only come because the other one was supposed to be there.
251. She'd been visiting her grandmother's grave for years. Someone else was always there before her with fresh flowers.
252. They were seated next to each other on a 14-hour flight and agreed to be completely honest for the duration.
253. He moved into her building during the worst month of her life. He brought soup every time without being asked.
254. She was helping him move out. She started finding reasons to slow down.
255. The book club had been meeting for ten years. Tonight, two of them finally admitted they'd only joined for each other.
256. He asked for her number. She gave him the wrong one by accident. He found her anyway.
257. They both reached for the last copy of the same book. Neither of them let go.
258. She needed a fake boyfriend for one evening. He was a terrible liar.
259. They had met, fallen in love, and broken up entirely over handwritten letters.
260. He had one day to say everything he'd been holding back for three years.
261. She ran into her ex at the worst possible moment. He was with someone wonderful. So was she.
262. They competed for the same promotion. One of them got it. Neither of them expected what came next.
263. The wedding was cancelled. Both of them ended up at the same bar that night.
264. She didn't believe in love at first sight until she realized she'd been slowly falling for years.
265. They had one summer and both knew it. They didn't talk about what happened after.
266. He came back to the town he'd grown up in and found everything had changed except one thing.
267. She apologized. He listened. Neither of them expected what came after the silence.
268. They had grown apart so slowly that neither noticed until they were strangers.
269. He wrote her name in every journal he'd kept since he was fifteen. She found the oldest one.
270. The first date ended at 4am with both of them still talking.
271. She was his emergency contact. She'd never thought about what that meant until the call came.
272. They argued constantly about everything small. They agreed on every single thing that mattered.
273. He didn't notice her for years. Then one unremarkable Tuesday, he did.
274. She moved away and came back twice. The third time, he was waiting.
275. The flowers he sent every year on her birthday never had a note. Until this year.
276. They'd been neighbors for a decade and never spoken. The power cut changed that.
277. He loved her in a way he didn't have words for, so he kept finding other ways to say it.
278. She was leaving the country. He was at the airport for a different reason entirely.
279. They had one photograph from the night they met. They'd spent fifteen years looking for each other.
280. He finally told her the truth. It turned out she'd known the whole time.

## LITERARY & INTROSPECTIVE (281–340)

281. She inherited her grandmother's house and found every clock stopped at the same time.
282. The letter arrived twenty years after it was sent.
283. He had lived his whole life in the same town and loved it. Today he wasn't sure why.
284. She kept a journal her whole life. On the last page she wrote one sentence she'd never said aloud.
285. The old man looked at everything he'd built and wondered if he'd built the right thing.
286. She returned to her childhood home to find it smaller than she remembered and more important.
287. He had one chance to tell his father something. His father wasn't listening. He said it anyway.
288. The photograph was the last thing she had left. She looked at it until she didn't need it anymore.
289. She'd spent 40 years being practical. Today she did something completely impractical.
290. He realized on the drive home that the meeting had changed everything. He pulled over.
291. The thing she'd been afraid of her whole life turned out to be something else wearing that face.
292. She forgave someone who would never know it. It was still worth it.
293. He had one day with no obligations and found he didn't know what he wanted.
294. The city she grew up in existed only in memory now. She went back to look anyway.
295. She quit the job she'd had for fifteen years on a Tuesday without telling anyone. Then she had to figure out what she'd actually wanted.
296. He didn't realize it was the last time until it was over.
297. The argument had lasted three years. When it finally ended, neither of them could remember how it started.
298. She sat with her mother in the hospital and said the things she thought she'd have more time to say.
299. He wasn't good at feelings. He was learning.
300. The dream came back every year on the same date. This year, she finally understood it.
301. She'd been angry for so long that she forgot what she'd been angry about.
302. He walked the road he'd walked every day of his childhood and tried to feel something.
303. The thing she'd been chasing her entire career finally arrived. It wasn't what she'd expected.
304. She told the story differently depending on who was listening. Today she told it to herself.
305. He had spent years becoming someone he thought he should be. He was ready to stop.
306. The old woman on the park bench had a story nobody had ever asked for. Today someone did.
307. She finished the book she'd been writing for ten years. She sat with it and wasn't sure it was enough. Then she wasn't sure "enough" was the right measure.
308. He called his brother after seven years of silence. The phone rang for a long time.
309. She moved to a new city and had to decide, again, who she wanted to be.
310. The decision he'd been avoiding made itself while he wasn't looking.
311. She had everything she'd worked for. She sat in it quietly and tried to feel it.
312. He let go of something he'd been holding onto since he was nine years old.
313. She stopped performing happiness and wasn't sure what came next.
314. He walked away from the conversation knowing he'd said the wrong thing and couldn't take it back.
315. The year had been hard. She wrote down the things it had given her anyway.
316. She tried to explain the feeling and found she didn't have the words. She wrote around the edges instead.
317. He went home for the holidays and found that home meant something different now.
318. The apology came too late to fix things and too early not to matter.
319. She sat in the quiet after everyone had left and let herself feel it.
320. He had been strong for so long. He wasn't sure he remembered how to not be.
321. The question she'd been asked at dinner stayed with her all night.
322. She watched her daughter do something she'd given up on years ago. She started again.
323. He drove past the place where it happened and didn't stop. Then he turned around.
324. The thing she'd been most proud of turned out to be something very small.
325. He said yes when he meant no and spent the next six months finding his way back.
326. She got the thing she'd asked the universe for and immediately asked for something else.
327. He cried on a train and a stranger said nothing and it was exactly right.
328. The last entry in her journal was a list of things she was still grateful for.
329. He hadn't painted in twelve years. He sat in front of the canvas anyway.
330. She decided to stop explaining herself and see what happened.
331. The birthday he'd forgotten was the one that mattered most. He spent the year making it up.
332. She listened to the voicemail she'd saved for two years and finally deleted it.
333. He told the truth in a meeting and the room went very quiet and then something shifted.
334. The conversation she dreaded turned out to be the one she needed most.
335. She lived carefully for years. Then she didn't. The world didn't end.
336. He sat with his grief instead of running from it. It was not as loud as he expected.
337. She made the call she'd been putting off. The other person had been waiting.
338. He wrote a letter he would never send and felt lighter.
339. She stopped waiting for permission.
340. He looked at his life and, for the first time, didn't see what was missing.

## DARK & SURREAL (341–390)

341. The vending machine gave her something she hadn't paid for and couldn't identify.
342. She woke up and everyone in the world had forgotten one specific word. It was different for each person.
343. The city started moving at night, rearranging its streets before morning.
344. He could see the color of people's lies. The world was very colorful.
345. The birds stopped migrating. Every species. All at once.
346. She found a door in the sky and climbed to it anyway.
347. The last dream anyone on Earth had was the same dream.
348. He ate the same meal every day for a year. On day 366 it tasted different. He was different.
349. The shadows started arriving five minutes before the people they belonged to.
350. She woke up speaking a language she didn't know. It took her three days to realize it was her own, and she had forgotten everything else.
351. The museum had one exhibit no one was allowed to describe after seeing it.
352. He watched the moon fall toward Earth and realized he was the only one looking up.
353. The library had a section for books that hadn't been written yet. She checked one out.
354. The road never ended. She stopped counting miles and started counting something else.
355. He found a coin that made him invisible only to people who loved him.
356. The town voted to forget something collectively. Nobody could remember what they had voted on.
357. She collected the sounds of things that no longer existed.
358. The elevator in her building had a floor between 7 and 8. She got off there once.
359. He dreamed in a language that didn't have words — only feelings with textures.
360. The thing she'd lost as a child had been waiting in the exact place she'd left it.
361. She could hold time still for exactly one breath. She used it every day.
362. The fog came and when it lifted, everyone had aged differently.
363. He had been having the same Tuesday for three weeks. He was getting better at it.
364. The hole in the middle of town had been there so long the children played around it.
365. She found a map of every place she had ever cried.
366. The day lasted 30 hours and no one mentioned it.
367. He could smell the future. It was complicated.
368. The second moon appeared on a Thursday. By Friday, everyone had a theory.
369. She wrote the same word every day for a year and on the last day it meant something completely different.
370. The city had two suns and nobody agreed on which one was real.
371. He woke up speaking in perfect rhyme and couldn't stop.
372. The radio station played only music from the future.
373. She could hold time still for exactly one breath. She used it every day.
374. The train schedule listed a destination no one recognized. Tickets were sold out.
375. He found a room where gravity worked sideways. He sat in it when he needed to think.
376. She inherited a house that was larger on the inside every time she came back.
377. The color red disappeared from the world on a Wednesday. The implications were enormous.
378. He talked to his reflection for so long it developed opinions of its own.
379. She found a photograph of a memory she was sure she hadn't made yet.
380. The town had one rule: no one left without being replaced.
381. He could hear the ocean from his apartment in the middle of the desert. He had lived there for years.
382. She planted something she couldn't name and tended it until it was too big to understand.
383. The sky was the wrong color for the third day in a row. Everyone pretended not to notice.
384. He dreamed he was someone else so vividly he forgot which one he was.
385. The numbers on her clock rearranged themselves into something that wasn't time.
386. She walked into the photograph and couldn't find the edge.
387. The word on the tip of his tongue was the answer to something enormous.
388. She heard her name in a language she'd invented as a child and told no one.
389. The river ran uphill one morning and the fish didn't seem surprised.
390. He closed his eyes and opened them somewhere completely different. He went back to close what he'd left open.

## ADVENTURE & ACTION (391–440)

391. The expedition had been planned for three years. On day one, everything went wrong.
392. She survived the crash. Now she had to survive everything after.
393. He had one night to cross a city that no longer wanted him in it.
394. The treasure map was accurate. The treasure wasn't what anyone expected.
395. She'd been trained for every scenario except this one.
396. The last working vehicle in the convoy was hers. She'd never driven anything larger than a sedan.
397. He had to deliver a package across a border that no longer officially existed.
398. The mission was simple. The exit was not.
399. She was the only one who knew where they were going. She was also the only one who didn't know how to get there.
400. The chase began as a misunderstanding. It had long since become something else.
401. He had 48 hours to find the thing before the people chasing him did.
402. The bridge was out. The river was rising. She looked at what she had and started building.
403. They had to reach the summit before the storm did. The storm had a head start.
404. He'd been in worse situations. He was having trouble remembering when.
405. The escape plan required exactly four things. She had three.
406. She took the wrong turn and ended up somewhere she was desperately needed.
407. He outran them. Then he realized he'd run in the wrong direction.
408. The heist was flawless. The aftermath was not.
409. She was hired to protect someone who didn't want to be protected.
410. The road ended. She didn't.
411. He had been underestimated his entire life. Today that was his only advantage.
412. The safe house wasn't safe anymore. They had ten minutes.
413. She jumped and figured out the landing on the way down.
414. The signal led them deep into territory no one had mapped.
415. He had to trust someone he had every reason not to.
416. The storm hit at the worst possible moment. She found out what she was made of.
417. They were outnumbered. She'd been in worse odds before, just not by this much.
418. He crossed the desert alone with three days of water and a destination he wasn't sure existed.
419. The operation had one rule: no one gets left behind. Someone was about to test that.
420. She ran toward the explosion instead of away from it. There was a reason.
421. The shortcut turned out to be anything but.
422. He negotiated from a position of zero leverage and walked away with everything.
423. The last radio transmission gave a location and a warning. She went anyway.
424. She was one step ahead. Then she wasn't. Then she had to think faster than she ever had.
425. The mission was extraction. The person being extracted didn't want to go.
426. He climbed the wall without knowing what was on the other side.
427. They had to hold the line for 20 minutes. It felt like a different kind of forever.
428. She found a weapon she didn't know how to use and had thirty seconds to figure it out.
429. He chose the hard road when the easy one was right there. He was never sure if it was the right choice.
430. The ambush failed. Now both sides had to figure out what to do next.
431. She tracked the signal to its source and found something she couldn't report.
432. The infiltration was going perfectly. Then someone recognized him.
433. He had to win without fighting. He'd never tried that before.
434. The wilderness didn't care about her training. She had to care about it.
435. She found the people she was looking for. Getting them out was a different problem.
436. The countdown reached zero. Nothing happened. That was the problem.
437. He crossed three borders in 24 hours with a name he didn't own.
438. The only way out was through the thing she'd been running from.
439. She made it to the other side. Looking back, she understood what she'd crossed.
440. He finished the race and realized the race had never been the point.

## COMEDY & ABSURDIST (441–470)

441. The office had been running on the same printer for 22 years. Today it had opinions.
442. She accidentally applied for a job she wasn't remotely qualified for and somehow made it to the final round.
443. He texted the wrong person something deeply personal. The wrong person turned out to be the right one.
444. The coffee shop got her order wrong every single day in a way that was somehow exactly right.
445. She agreed to housesit for a neighbor and immediately encountered something no one had warned her about.
446. He accidentally started a trend he couldn't stop and didn't understand.
447. The autocorrect had been making her life interesting for weeks. Today it went too far.
448. She showed up to the wrong meeting and accidentally solved a problem that had been open for two years.
449. He tried to cancel his gym membership and ended up in a philosophical debate.
450. The customer service call lasted four hours and ended in an unexpected friendship.
451. She volunteered for something without reading what she was volunteering for.
452. He rented a van for a simple move and came home with three extra passengers and no explanation.
453. The wedding toast went off script after the first sentence. It went better that way.
454. She tried to make a professional impression and immediately tripped over everything.
455. He followed a recipe exactly and produced something that was technically food.
456. The group chat had 47 unread messages. She was afraid to open it.
457. She took a wrong exit and ended up at an event she was somehow expected at.
458. He tried to explain something simple and it became the most complicated conversation of his life.
459. The presentation was going well until the slide deck had other ideas.
460. She tried to be mature about it and lasted eleven minutes.
461. He bought a plant. It had a personality. This became a problem.
462. The reunion was going fine until someone brought up the thing everyone agreed not to bring up.
463. She asked a simple question at the town hall. Two hours later, she was somehow in charge.
464. He tried to sneak out of a party and accidentally made a grand exit.
465. The translation app made the negotiation significantly more interesting than planned.
466. She tried to fix one small thing and discovered it was connected to everything else.
467. He said "sure, how hard could it be" and immediately found out.
468. The shortcut through the kitchen at the party became a very long conversation.
469. She sent an email to the wrong department. The wrong department was surprisingly helpful.
470. He borrowed something small. It spiraled into the most elaborate chain of events of his life.

## OPEN & EXPERIMENTAL (471–500)

471. Write about a color that doesn't exist yet.
472. The last sentence of the story was the first one she wrote. Start from there.
473. Describe silence in a place that is never quiet.
474. Write from the perspective of the space between two people who are not speaking.
475. The thing nobody said out loud was the loudest thing in the room.
476. Write a story that begins at the end of something and ends at the beginning.
477. Describe a place by the sounds it makes when no one is there.
478. The object had passed through forty hands before it reached hers.
479. Write about a decision that was made before anyone realized it had been made.
480. The word had lost its meaning. She had to find a new one.
481. Describe home to someone who has never had one.
482. He left something behind in every place he'd ever been. Write about the last one.
483. Write about a moment that lasted longer than it should have.
484. The feeling didn't have a name. Write it anyway.
485. She kept the thing nobody else thought was worth keeping.
486. Write about what happens in the city after everyone goes to sleep.
487. The memory arrived without permission and stayed.
488. He tried to explain why he stayed. He was still explaining.
489. Write about the space between who someone was and who they became.
490. The road looked the same in both directions. She picked one anyway.
491. Write about something ordinary as though you are encountering it for the first time.
492. The conversation ended before it was finished. Write the rest.
493. She kept coming back to the same page. Write what was on it.
494. Write about a goodbye that didn't know it was one.
495. He watched something end and tried to hold the last moment still.
496. Write about what it feels like to wait for something you're not sure is coming.
497. She carried something invisible everywhere she went.
498. Write about the moment just before everything changed.
499. The answer arrived too late to be useful and too true to ignore.
500. Write about beginning again.
\`;

const brainrotPrompts = [
  { id: 1001, text: "Write an apology essay, but you're a TikToker who got caught stealing a meme...", category: "brainrot" },
  { id: 1002, text: "Explain the plot of Hamlet but entirely in Gen Z slang...", category: "brainrot" },
  { id: 1003, text: "Your aura just dropped to zero in front of your crush. What do you do?", category: "brainrot" },
  { id: 1004, text: "You woke up and realized your entire life was just a 10-hour podcast ad read...", category: "brainrot" },
  { id: 1005, text: "The villain's evil plan is just to slightly inconvenience everyone's Wi-Fi connection...", category: "brainrot" },
  { id: 1006, text: "You have to defend yourself in court, but your lawyer only speaks in brainrot...", category: "brainrot" },
  { id: 1007, text: "Your group chat got leaked to the FBI, and now they're asking questions about...", category: "brainrot" },
  { id: 1008, text: "The Grim Reaper showed up, but you challenged him to a 1v1 on Rust...", category: "brainrot" },
  { id: 1009, text: "You tried to touch grass, but the grass touched you back...", category: "brainrot" },
  { id: 1010, text: "A time traveler arrives from 2050 to warn you about the Great Ratio of 2029...", category: "brainrot" },
  { id: 1011, text: "Your Spotify Wrapped was so unhinged that Spotify sent a wellness check...", category: "brainrot" },
  { id: 1012, text: "Write a dramatic monologue about burning your mouth on a Hot Pocket...", category: "brainrot" },
  { id: 1013, text: "You accidentally liked a picture from 2012, and now the original poster is...", category: "brainrot" },
  { id: 1014, text: "The only way to save the world is to post a cringe dance on TikTok...", category: "brainrot" },
  { id: 1015, text: "Your sleep paralysis demon is actually just a really annoying crypto bro...", category: "brainrot" },
  { id: 1016, text: "You got trapped in an elevator with a guy who won't stop talking about his podcast...", category: "brainrot" },
  { id: 1017, text: "Explain the economy to a Victorian child using only Fortnite terms...", category: "brainrot" },
  { id: 1018, text: "You discovered the secret to immortality, but it requires spending 5 hours a day on Twitter...", category: "brainrot" },
  { id: 1019, text: "The aliens landed, but they just wanted to know if we had games on our phones...", category: "brainrot" },
  { id: 1020, text: "Write a Yelp review for the concept of 'consciousness'...", category: "brainrot" },
  { id: 1021, text: "You have to explain to your parents why you bought 10,000 V-Bucks using their card...", category: "brainrot" },
  { id: 1022, text: "The protagonist is a sentient vape pen searching for its owner...", category: "brainrot" },
  { id: 1023, text: "You found a cursed artifact that forces you to narrate your life like a YouTuber...", category: "brainrot" },
  { id: 1024, text: "Describe a boss fight, but the boss is your Wi-Fi randomly disconnecting...", category: "brainrot" },
  { id: 1025, text: "You're trying to hide from a serial killer, but your phone starts playing a loud ad...", category: "brainrot" },
  { id: 1026, text: "The president declared a national emergency because the servers went down...", category: "brainrot" },
  { id: 1027, text: "You entered a cooking competition, but your only ingredient is existential dread...", category: "brainrot" },
  { id: 1028, text: "Write an epic fantasy battle, but the weapons are oversized foam fingers...", category: "brainrot" },
  { id: 1029, text: "You woke up as an NPC in a game, and the main character just quicksaved next to you...", category: "brainrot" },
  { id: 1030, text: "The prophecy foretold of a hero who could read an entire terms and conditions agreement...", category: "brainrot" },
];

const lines = rawText.split('\\n');
const prompts = [];
let currentCategory = '';

const categoryMap = {
  'MYSTERY & SUSPENSE': 'mystery',
  'SCIENCE FICTION': 'scifi',
  'FANTASY': 'scifi',
  'HORROR': 'horror',
  'ROMANCE & HUMAN CONNECTION': 'romance',
  'LITERARY & INTROSPECTIVE': 'slice',
  'DARK & SURREAL': 'philosophy',
  'ADVENTURE & ACTION': 'adventure',
  'COMEDY & ABSURDIST': 'humor',
  'OPEN & EXPERIMENTAL': 'meta'
};

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    const header = trimmed.replace('## ', '').split(' (')[0];
    currentCategory = categoryMap[header] || 'mystery';
  } else if (/^\\d+\\./.test(trimmed)) {
    const match = trimmed.match(/^(\\d+)\\.\\s+(.*)$/);
    if (match) {
      prompts.push({
        id: parseInt(match[1]),
        text: match[2].trim(),
        category: currentCategory
      });
    }
  }
}

const allPrompts = [...prompts, ...brainrotPrompts];

const fileContent = \`// Sprinting Ink — 500 Writing Prompts + Brainrot Easter Eggs
const PROMPTS = \${JSON.stringify(allPrompts, null, 2)};

const CATEGORIES = [
  { id: "all", label: "All Categories", icon: "🎲" },
  { id: "mystery", label: "Mystery & Thriller", icon: "🔍" },
  { id: "humor", label: "Humor & Absurd", icon: "😂" },
  { id: "scifi", label: "Sci-Fi & Fantasy", icon: "🚀" },
  { id: "romance", label: "Romance & Drama", icon: "💕" },
  { id: "horror", label: "Horror & Creepy", icon: "👻" },
  { id: "slice", label: "Slice of Life", icon: "☕" },
  { id: "philosophy", label: "Philosophy & Deep", icon: "🧠" },
  { id: "adventure", label: "Adventure", icon: "🗺️" },
  { id: "historical", label: "Historical", icon: "📜" },
  { id: "meta", label: "Meta & Writing", icon: "✍️" },
];

export function getRandomPrompt(category = "all") {
  // 5% chance of Brainrot override
  const wantsBrainrot = Math.random() < 0.05;

  if (wantsBrainrot) {
    const brainrotPrompts = PROMPTS.filter(p => p.category === "brainrot");
    return brainrotPrompts[Math.floor(Math.random() * brainrotPrompts.length)];
  }

  const normalPrompts = PROMPTS.filter(p => p.category !== "brainrot");
  const filtered = category === "all" 
    ? normalPrompts 
    : normalPrompts.filter(p => p.category === category);
    
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getCategoryLabel(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.label : categoryId;
}

export { PROMPTS, CATEGORIES };
\`;

fs.writeFileSync('/Users/user/Documents/sprinting.ink/sprinting.ink/src/data/prompts.js', fileContent);
console.log('Successfully updated prompts.js');
