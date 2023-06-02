
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
378
379
380
381
382
383
384
385
386
387
388
389
390
391
392
393
394
395
396
397
398
399
400
401
402
403
404
405
406
407
408
409
410
411
412
413
414
415
416
417
418
419
420
421
422
423
424
425
426
427
428
429
430
431
432
433
434
435
436
437
438
439
440
441
442
443
444
445
446
447
448
449
450
451
452
453
454
455
456
457
458
459
460
461
462
463
464
465
466
467
468
469
470
471
472
473
474
475
476
477
478
479
480
481
482
483
484
485
486
487
488
489
490
491
492
493
494
495
496
497
498
499
500
501
502
503
504
505
506
507
508
509
510
511
512
513
514
515
516
517
518
519
520
521
522
523
524
525
526
527
528
529
530
531
532
533
534
535
536
537
538
539
540
541
542
543
544
545
546
547
548
549
550
551
552
553
554
555
556
557
558
559
560
561
562
563
564
565
566
567
568
569
570
571
572
573
574
575
576
577
578
579
580
581
582
583
584
585
586
587
588
589
590
591
592
593
594
595
596
597
598
599
600
601
602
603
604
605
606
607
608
609
610
611
612
613
614
615
616
617
618
619
620
621
622
623
624
625
626
627
628
629
630
631
632
633
634
635
636
637
638
639
640
641
642
643
644
645
646
647
648
649
650
651
652
653
654
655
656
657
658
659
660
661
662
663
664
665
666
667
668
669
670
671
672
673
674
675
676
677
678
679
680
681
682
683
684
685
686
687
688
689
690
691
692
693
694
695
696
697
698
699
700
701
702
703
704
705
706
707
708
709
710
711
712
713
714
715
716
717
718
719
720
721
722
723
724
725
726
727
728
729
730
731
732
733
734
735
736
737
738
739
740
741
742
743
744
745
746
747
748
749
750
751
752
753
754
755
756
757
758
759
760
761
762
763
764
765
766
767
768
769
770
771
772
773
774
775
776
777
778
779
780
781
782
783
784
785
786
787
788
789
790
791
792
793
794
795
796
797
798
799
800
801
802
803
804
805
806
807
808
809
810
811
812
813
814
815
816
817
818
819
820
821
822
823
824
825
826
827
828
829
830
831
832
833
834
835
836
837
838
839
840
841
842
843
844
845
846
847
848
849
850
851
852
853
854
855
856
857
858
859
860
861
862
863
864
865
866
867
868
869
870
871
872
873
874
875
876
877
878
879
880
881
882
883
884
885
886
887
888
889
890
891
892
893
894
895
896
897
898
899
900
901
902
903
904
905
906
907
908
909
910
911
912
913
914
915
916
917
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */


var _Group = function () {
    this._tweens = {};
    this._tweensAddedDuringUpdate = {};
};

_Group.prototype = {
    getAll: function () {

        return Object.keys(this._tweens).map(function (tweenId) {
            return this._tweens[tweenId];
        }.bind(this));

    },

    removeAll: function () {

        this._tweens = {};

    },

    add: function (tween) {

        this._tweens[tween.getId()] = tween;
        this._tweensAddedDuringUpdate[tween.getId()] = tween;

    },

    remove: function (tween) {

        delete this._tweens[tween.getId()];
        delete this._tweensAddedDuringUpdate[tween.getId()];

    },

    update: function (time, preserve) {

        var tweenIds = Object.keys(this._tweens);

        if (tweenIds.length === 0) {
            return false;
        }

        time = time !== undefined ? time : TWEEN.now();

        // Tweens are updated in "batches". If you add a new tween during an update, then the
        // new tween will be updated in the next batch.
        // If you remove a tween during an update, it may or may not be updated. However,
        // if the removed tween was added during the current batch, then it will not be updated.
        while (tweenIds.length > 0) {
            this._tweensAddedDuringUpdate = {};

            for (var i = 0; i < tweenIds.length; i++) {

                var tween = this._tweens[tweenIds[i]];

                if (tween && tween.update(time) === false) {
                    tween._isPlaying = false;

                    if (!preserve) {
                        delete this._tweens[tweenIds[i]];
                    }
                }
            }

            tweenIds = Object.keys(this._tweensAddedDuringUpdate);
        }

        return true;

    }
};

var TWEEN = new _Group();

TWEEN.Group = _Group;
TWEEN._nextId = 0;
TWEEN.nextId = function () {
    return TWEEN._nextId++;
};


// Include a performance.now polyfill.
// In node.js, use process.hrtime.
if (typeof (window) === 'undefined' && typeof (process) !== 'undefined') {
    TWEEN.now = function () {
        var time = process.hrtime();

        // Convert [seconds, nanoseconds] to milliseconds.
        return time[0] * 1000 + time[1] / 1000000;
    };
}
// In a browser, use window.performance.now if it is available.
else if (typeof (window) !== 'undefined' &&
    window.performance !== undefined &&
    window.performance.now !== undefined) {
    // This must be bound, because directly assigning this function
    // leads to an invocation exception in Chrome.
    TWEEN.now = window.performance.now.bind(window.performance);
}
// Use Date.now if it is available.
else if (Date.now !== undefined) {
    TWEEN.now = Date.now;
}
// Otherwise, use 'new Date().getTime()'.
else {
    TWEEN.now = function () {
        return new Date().getTime();
    };
}


TWEEN.Tween = function (object, group) {
    this._object = object;
    this._valuesStart = {};
    this._valuesEnd = {};
    this._valuesStartRepeat = {};
    this._duration = 1000;
    this._repeat = 0;
    this._repeatDelayTime = undefined;
    this._yoyo = false;
    this._isPlaying = false;
    this._reversed = false;
    this._delayTime = 0;
    this._startTime = null;
    this._easingFunction = TWEEN.Easing.Linear.None;
    this._interpolationFunction = TWEEN.Interpolation.Linear;
    this._chainedTweens = [];
    this._onStartCallback = null;
    this._onStartCallbackFired = false;
    this._onUpdateCallback = null;
    this._onCompleteCallback = null;
    this._onStopCallback = null;
    this._group = group || TWEEN;
    this._id = TWEEN.nextId();

};

TWEEN.Tween.prototype = {
    getId: function getId() {
        return this._id;
    },

    isPlaying: function isPlaying() {
        return this._isPlaying;
    },

    to: function to(properties, duration) {

        this._valuesEnd = properties;

        if (duration !== undefined) {
            this._duration = duration;
        }

        return this;

    },

    start: function start(time) {

        this._group.add(this);

        this._isPlaying = true;

        this._onStartCallbackFired = false;

        this._startTime = time !== undefined ? typeof time === 'string' ? TWEEN.now() + parseFloat(time) : time : TWEEN.now();
        this._startTime += this._delayTime;

        for (var property in this._valuesEnd) {

            // Check if an Array was provided as property value
            if (this._valuesEnd[property] instanceof Array) {

                if (this._valuesEnd[property].length === 0) {
                    continue;
                }

                // Create a local copy of the Array with the start value at the front
                this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);

            }

            // If `to()` specifies a property that doesn't exist in the source object,
            // we should not set that property in the object
            if (this._object[property] === undefined) {
                continue;
            }

            // Save the starting value.
            this._valuesStart[property] = this._object[property];

            if ((this._valuesStart[property] instanceof Array) === false) {
                this._valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
            }

            this._valuesStartRepeat[property] = this._valuesStart[property] || 0;

        }

        return this;

    },

    stop: function stop() {

        if (!this._isPlaying) {
            return this;
        }

        this._group.remove(this);
        this._isPlaying = false;

        if (this._onStopCallback !== null) {
            this._onStopCallback(this._object);
        }

        this.stopChainedTweens();
        return this;

    },

    end: function end() {

        this.update(this._startTime + this._duration);
        return this;

    },

    stopChainedTweens: function stopChainedTweens() {

        for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
            this._chainedTweens[i].stop();
        }

    },

    group: function group(group) {
        this._group = group;
        return this;
    },

    delay: function delay(amount) {

        this._delayTime = amount;
        return this;

    },

    repeat: function repeat(times) {

        this._repeat = times;
        return this;

    },

    repeatDelay: function repeatDelay(amount) {

        this._repeatDelayTime = amount;
        return this;

    },

    yoyo: function yoyo(yy) {

        this._yoyo = yy;
        return this;

    },

    easing: function easing(eas) {

        this._easingFunction = eas;
        return this;

    },

    interpolation: function interpolation(inter) {

        this._interpolationFunction = inter;
        return this;

    },

    chain: function chain() {

        this._chainedTweens = arguments;
        return this;

    },

    onStart: function onStart(callback) {

        this._onStartCallback = callback;
        return this;

    },

    onUpdate: function onUpdate(callback) {

        this._onUpdateCallback = callback;
        return this;

    },

    onComplete: function onComplete(callback) {

        this._onCompleteCallback = callback;
        return this;

    },

    onStop: function onStop(callback) {

        this._onStopCallback = callback;
        return this;

    },

    update: function update(time) {

        var property;
        var elapsed;
        var value;

        if (time < this._startTime) {
            return true;
        }

        if (this._onStartCallbackFired === false) {

            if (this._onStartCallback !== null) {
                this._onStartCallback(this._object);
            }

            this._onStartCallbackFired = true;
        }

        elapsed = (time - this._startTime) / this._duration;
        elapsed = (this._duration === 0 || elapsed > 1) ? 1 : elapsed;

        value = this._easingFunction(elapsed);

        for (property in this._valuesEnd) {

            // Don't update properties that do not exist in the source object
            if (this._valuesStart[property] === undefined) {
                continue;
            }

            var start = this._valuesStart[property] || 0;
            var end = this._valuesEnd[property];

            if (end instanceof Array) {

                this._object[property] = this._interpolationFunction(end, value);

            } else {

                // Parses relative end values with start as base (e.g.: +10, -3)
                if (typeof (end) === 'string') {

                    if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                        end = start + parseFloat(end);
                    } else {
                        end = parseFloat(end);
                    }
                }

                // Protect against non numeric properties.
                if (typeof (end) === 'number') {
                    this._object[property] = start + (end - start) * value;
                }

            }

        }

        if (this._onUpdateCallback !== null) {
            this._onUpdateCallback(this._object);
        }

        if (elapsed === 1) {

            if (this._repeat > 0) {

                if (isFinite(this._repeat)) {
                    this._repeat--;
                }

                // Reassign starting values, restart by making startTime = now
                for (property in this._valuesStartRepeat) {

                    if (typeof (this._valuesEnd[property]) === 'string') {
                        this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
                    }

                    if (this._yoyo) {
                        var tmp = this._valuesStartRepeat[property];

                        this._valuesStartRepeat[property] = this._valuesEnd[property];
                        this._valuesEnd[property] = tmp;
                    }

                    this._valuesStart[property] = this._valuesStartRepeat[property];

                }

                if (this._yoyo) {
                    this._reversed = !this._reversed;
                }

                if (this._repeatDelayTime !== undefined) {
                    this._startTime = time + this._repeatDelayTime;
                } else {
                    this._startTime = time + this._delayTime;
                }

                return true;

            } else {

                if (this._onCompleteCallback !== null) {

                    this._onCompleteCallback(this._object);
                }

                for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                    // Make the chained tweens start exactly at the time they should,
                    // even if the `update()` method was called way past the duration of the tween
                    this._chainedTweens[i].start(this._startTime + this._duration);
                }

                return false;

            }

        }

        return true;

    }
};


TWEEN.Easing = {

    Linear: {

        None: function (k) {

            return k;

        }

    },

    Quadratic: {

        In: function (k) {

            return k * k;

        },

        Out: function (k) {

            return k * (2 - k);

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k;
            }

            return - 0.5 * (--k * (k - 2) - 1);

        }

    },

    Cubic: {

        In: function (k) {

            return k * k * k;

        },

        Out: function (k) {

            return --k * k * k + 1;

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k * k;
            }

            return 0.5 * ((k -= 2) * k * k + 2);

        }

    },

    Quartic: {

        In: function (k) {

            return k * k * k * k;

        },

        Out: function (k) {

            return 1 - (--k * k * k * k);

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k;
            }

            return - 0.5 * ((k -= 2) * k * k * k - 2);

        }

    },

    Quintic: {

        In: function (k) {

            return k * k * k * k * k;

        },

        Out: function (k) {

            return --k * k * k * k * k + 1;

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k * k;
            }

            return 0.5 * ((k -= 2) * k * k * k * k + 2);

        }

    },

    Sinusoidal: {

        In: function (k) {

            return 1 - Math.cos(k * Math.PI / 2);

        },

        Out: function (k) {

            return Math.sin(k * Math.PI / 2);

        },

        InOut: function (k) {

            return 0.5 * (1 - Math.cos(Math.PI * k));

        }

    },

    Exponential: {

        In: function (k) {

            return k === 0 ? 0 : Math.pow(1024, k - 1);

        },

        Out: function (k) {

            return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

        },

        InOut: function (k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            if ((k *= 2) < 1) {
                return 0.5 * Math.pow(1024, k - 1);
            }

            return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

        }

    },

    Circular: {

        In: function (k) {

            return 1 - Math.sqrt(1 - k * k);

        },

        Out: function (k) {

            return Math.sqrt(1 - (--k * k));

        },

        InOut: function (k) {

            if ((k *= 2) < 1) {
                return - 0.5 * (Math.sqrt(1 - k * k) - 1);
            }

            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

        }

    },

    Elastic: {

        In: function (k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

        },

        Out: function (k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

        },

        InOut: function (k) {

            if (k === 0) {
                return 0;
            }

            if (k === 1) {
                return 1;
            }

            k *= 2;

            if (k < 1) {
                return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
            }

            return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

        }

    },

    Back: {

        In: function (k) {

            var s = 1.70158;

            return k * k * ((s + 1) * k - s);

        },

        Out: function (k) {

            var s = 1.70158;

            return --k * k * ((s + 1) * k + s) + 1;

        },

        InOut: function (k) {

            var s = 1.70158 * 1.525;

            if ((k *= 2) < 1) {
                return 0.5 * (k * k * ((s + 1) * k - s));
            }

            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

        }

    },

    Bounce: {

        In: function (k) {

            return 1 - TWEEN.Easing.Bounce.Out(1 - k);

        },

        Out: function (k) {

            if (k < (1 / 2.75)) {
                return 7.5625 * k * k;
            } else if (k < (2 / 2.75)) {
                return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
            } else if (k < (2.5 / 2.75)) {
                return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
            } else {
                return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
            }

        },

        InOut: function (k) {

            if (k < 0.5) {
                return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
            }

            return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

        }

    }

};

TWEEN.Interpolation = {

    Linear: function (v, k) {

        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = TWEEN.Interpolation.Utils.Linear;

        if (k < 0) {
            return fn(v[0], v[1], f);
        }

        if (k > 1) {
            return fn(v[m], v[m - 1], m - f);
        }

        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

    },

    Bezier: function (v, k) {

        var b = 0;
        var n = v.length - 1;
        var pw = Math.pow;
        var bn = TWEEN.Interpolation.Utils.Bernstein;

        for (var i = 0; i <= n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }

        return b;

    },

    CatmullRom: function (v, k) {

        var m = v.length - 1;
        var f = m * k;
        var i = Math.floor(f);
        var fn = TWEEN.Interpolation.Utils.CatmullRom;

        if (v[0] === v[m]) {

            if (k < 0) {
                i = Math.floor(f = m * (1 + k));
            }

            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

        } else {

            if (k < 0) {
                return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            }

            if (k > 1) {
                return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            }

            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

        }

    },

    Utils: {

        Linear: function (p0, p1, t) {

            return (p1 - p0) * t + p0;

        },

        Bernstein: function (n, i) {

            var fc = TWEEN.Interpolation.Utils.Factorial;

            return fc(n) / fc(i) / fc(n - i);

        },

        Factorial: (function () {

            var a = [1];

            return function (n) {

                var s = 1;

                if (a[n]) {
                    return a[n];
                }

                for (var i = n; i > 1; i--) {
                    s *= i;
                }

                a[n] = s;
                return s;

            };

        })(),

        CatmullRom: function (p0, p1, p2, p3, t) {

            var v0 = (p2 - p0) * 0.5;
            var v1 = (p3 - p1) * 0.5;
            var t2 = t * t;
            var t3 = t * t2;

            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

        }

    }

};

// UMD (Universal Module Definition)
(function (root) {

    if (typeof define === 'function' && define.amd) {

        // AMD
        define([], function () {
            return TWEEN;
        });

    } else if (typeof module !== 'undefined' && typeof exports === 'object') {

        // Node.js
        module.exports = TWEEN;

    } else if (root !== undefined) {

        // Global variable
        root.TWEEN = TWEEN;

    }

})(this);