import json, subprocess, sys, os
E = sys.argv[1]; P = sys.argv[2]
C = json.load(open(os.path.join(E, "cues.json")))
DUR = 36.4
SFX = os.path.join(E, "sfx")
ANTHEM_OFFSET = 27.8 - C["reveal_jisr"]   # ضربة النشيد الأولى على «جسر»

# (الملف، زمن الوضع، المستوى dB، قصّ: [بداية، مدة] أو None، مرشّح إضافي)
cues = []
for t in (0.35, 0.97, 1.59, 2.21):                         # همسات الشائعات: بعيدة خافتة
    cues.append(("whoosh-short", t, -32, None, "lowpass=f=3000"))
cues.append(("riser", C["reveal_jisr"] - 1.6, -22, (8.40, 1.62), "afade=t=in:d=0.6"))  # صعود إلى الكشف
cues.append(("impact-bass-1", C["reveal_jisr"] - 0.02, -12, None, ""))                 # الكشف
for k, off in (("uktub", -0.20), ("bidoon", -0.28), ("aqall", -0.24), ("takhudh", -0.26)):
    cues.append(("whoosh-short", C[k] + off, -25, None, ""))                          # الانتقالات
cues.append(("whoosh", C["sawtak"] - 0.26, -21, None, ""))                            # انتقال الختام
for k in ("g_question", "g_concern", "g_idea", "g_rumor"):
    cues.append(("pop", C[k] - 0.06, -21, None, ""))                                  # البوابات
for k in ("ismak", "raqmak"):
    cues.append(("whoosh-short", C[k], -27, None, "highpass=f=1500"))                 # الشطب
cues.append(("ping", C["safeer"] - 0.10, -25, None, ""))                              # سفير التغيير
cues.append(("typing", C["ramz"], -24, (0.0, 0.66), "afade=t=out:st=0.5:d=0.16"))     # كتابة الرمز
cues.append(("ping", C["haala"] - 0.04, -22, None, ""))                               # الحالة ١
cues.append(("ping", C["sual2"] - 0.04, -22, None, ""))                               # الحالة ٢
cues.append(("chime", C["rasmi"] - 0.04, -19, None, ""))                              # الرد الرسمي
cues.append(("click-soft", C["ibda"] - 0.08, -18, None, ""))                          # ابدأ الحين
cues.append(("sparkle", C["ibda"], -27, None, ""))

inputs = ["-i", os.path.join(E, "vo.mp3"),
          "-i", os.path.join(P, "public/sound/anthem.mp3"),
          "-i", os.path.join(P, "public/sound/sonic-logo-short.mp3")]
for name, *_ in cues:
    inputs += ["-i", os.path.join(SFX, name + ".mp3")]

F = []
N = "aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo"
# التعليق: تأخير ٣٠٠ms، قصّ تحت ٧٥Hz، ضغط خفيف، ثم نسختان: للمزج وللتحكم بالموسيقى
F.append(f"[0:a]{N},adelay=300|300,highpass=f=75,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,apad=whole_dur={DUR},atrim=0:{DUR},asplit=2[vo][vosc]")
# الموسيقى: النشيد من نقطة تجعل ضربته على «جسر»، تخفت تحت الشعار الصوتي، وتنخفض تلقائيًا تحت الكلام
F.append(f"[1:a]{N},atrim=start={ANTHEM_OFFSET:.3f}:duration={DUR},asetpts=PTS-STARTPTS,"
         f"afade=t=in:d=0.9,afade=t=out:st={C['vo_end']-0.70:.2f}:d=1.30,volume=-1dB,"
         # أتمتة: المقدمة +٣dB، الجسم −٤٫٥dB، والانتقال داخل «نَفَس» النشيد فلا يُسمع ولا يُضعف الانفجار
         f"volume='if(lt(t,4.2),1.41,if(lt(t,6.0),1.41+(0.596-1.41)*(t-4.2)/1.8,0.596))':eval=frame[mus]")
F.append("[mus][vosc]sidechaincompress=threshold=0.06:ratio=3.5:attack=25:release=420:knee=6[duck]")
# الشعار الصوتي يختم
F.append(f"[2:a]{N},volume=-4dB,adelay={int((C['vo_end']+0.07)*1000)}|{int((C['vo_end']+0.07)*1000)}[logo]")
lbl = []
for i, (name, t, db, trim, extra) in enumerate(cues):
    idx = 3 + i
    chain = N
    if trim: chain += f",atrim=start={trim[0]}:duration={trim[1]},asetpts=PTS-STARTPTS"
    if extra: chain += "," + extra
    ms = max(0, int(round(t * 1000)))
    F.append(f"[{idx}:a]{chain},volume={db}dB,adelay={ms}|{ms}[s{i}]")
    lbl.append(f"[s{i}]")
F.append("".join(lbl) + f"amix=inputs={len(lbl)}:normalize=0:dropout_transition=0[sfx]")
F.append(f"[vo][duck][sfx][logo]amix=inputs=4:normalize=0:dropout_transition=0,atrim=0:{DUR}[mix]")

out = os.path.join(E, "mix_raw.wav")
cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
       "-filter_complex", ";".join(F), "-map", "[mix]", "-ar", "48000", "-c:a", "pcm_s24le", out]
subprocess.run(cmd, check=True)
json.dump({"anthem_offset": round(ANTHEM_OFFSET, 3), "cues": [(n, round(t, 2), db) for n, t, db, *_ in cues]},
          open(os.path.join(E, "cue_sheet.json"), "w"), ensure_ascii=False, indent=1)
print(f"المزج الخام: {out}")
print(f"النشيد يبدأ من {ANTHEM_OFFSET:.2f}ث · {len(cues)} مؤثرًا")
