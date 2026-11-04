/**
 * A fictional power of attorney, drawn in the browser and already transcribed
 * and translated — to try the workbench (review, edits, export) without
 * calling Claude. Its ID numbers are deliberately one valid, one invalid.
 */

import type { DocumentInput, Transcription, Translation } from "./model";

const EX = {
  header: "משרד עורכי דין ונוטריונים כהן ושות׳ · רח׳ ז׳בוטינסקי 7, רמת גן",
  title: "ייפוי כוח",
  paras: [
    'אני החתום מטה, ישראל ישראלי, ת.ז. 123456782, מרחוב הרצל 12, חולון, ממנה בזאת את עו"ד דנה לוי, מ.ר. 54321, להיות באת כוחי ולפעול בשמי בכל הקשור למכירת הדירה ברחוב סוקולוב 45, חולון, הידועה כגוש 6012 חלקה 87.',
    "מבלי לגרוע מכלליות האמור, באת כוחי רשאית לחתום על הסכם המכר, על שטרי המכר ועל כל מסמך הנדרש לרישום הזכויות בלשכת רישום המקרקעין, וכן לייצגני בפני רשות המסים.",
    "ייפוי כוח זה הינו בלתי חוזר, הואיל וזכויות צד שלישי תלויות בו.",
    "נחתם בנוכחות העד משה כהן, ת.ז. 032145679.",
    "ולראיה באתי על החתום, היום 14.10.2026.",
  ],
  translation: [
    "Cabinet d'avocats et de notaires Cohen & Associés · 7, rue Jabotinsky, Ramat Gan",
    "PROCURATION",
    "Je soussigné, Israël Israéli, titulaire de la carte d'identité n° 123456782, demeurant 12, rue Herzl à Holon, désigne par la présente Maître Dana Levy, inscrite au barreau sous le n° 54321, en qualité de mandataire, afin d'agir en mon nom pour tout ce qui concerne la vente de l'appartement situé 45, rue Sokolov à Holon, cadastré bloc (gush) 6012, parcelle (helka) 87.",
    "Sans préjudice de la portée générale de ce qui précède, ma mandataire est autorisée à signer le contrat de vente, les actes de mutation et tout document nécessaire à l'inscription des droits au Bureau du registre foncier, ainsi qu'à me représenter auprès de l'Administration fiscale.",
    "La présente procuration est irrévocable, des droits de tiers en dépendant.",
    "Signé en présence du témoin Moshé Cohen, carte d'identité n° 032145679.",
    "En foi de quoi, j'ai signé ce jour, le 14.10.2026.",
    "[Signature] Signature du mandant",
    "[Cachet : Notaire · Cohen & Associés]",
  ].join("\n\n"),
  terms: [
    {
      source: "ייפוי כוח בלתי חוזר",
      rendering: "procuration irrévocable",
      note: "Notion israélienne liée aux droits de tiers ; vérifier que la formulation retenue a la même portée.",
    },
    {
      source: "שטרי המכר",
      rendering: "actes de mutation",
      note: "Formulaire d'enregistrement foncier israélien sans équivalent exact en France.",
    },
    {
      source: "גוש / חלקה",
      rendering: "bloc (gush) / parcelle (helka)",
      note: "Références cadastrales israéliennes, souvent conservées en translittération.",
    },
    {
      source: "מ.ר.",
      rendering: "inscrite au barreau sous le n°",
      note: "Abréviation de « numéro de licence » de l'Ordre des avocats.",
    },
  ],
};

async function drawPage(): Promise<{
  blob: Blob;
  width: number;
  height: number;
}> {
  const face = '"Frank Ruhl Libre","Noto Serif Hebrew","Times New Roman",serif';
  try {
    await document.fonts.load(`400 31px ${face}`, "א");
  } catch {
    // fall back to whatever serif is there
  }
  const W = 1240;
  const H = 1754;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d")!;
  x.fillStyle = "#fdfdfb";
  x.fillRect(0, 0, W, H);
  const M = 130;
  const R = W - M;
  x.direction = "rtl";
  x.textAlign = "right";
  x.fillStyle = "#4a4a4a";
  let y = 150;
  x.font = `500 25px ${face}`;
  x.fillText(EX.header, R, y);
  y += 26;
  x.strokeStyle = "#9a9a9a";
  x.lineWidth = 1.5;
  x.beginPath();
  x.moveTo(M, y);
  x.lineTo(R, y);
  x.stroke();
  y += 120;
  x.textAlign = "center";
  x.fillStyle = "#151515";
  x.font = `700 50px ${face}`;
  x.fillText(EX.title, W / 2, y);
  y += 100;
  x.textAlign = "right";
  x.font = `400 31px ${face}`;
  x.fillStyle = "#1c1c1c";
  const wrap = (t: string) => {
    let line = "";
    for (const w of t.split(" ")) {
      const test = line ? `${line} ${w}` : w;
      if (x.measureText(test).width > R - M && line) {
        x.fillText(line, R, y);
        y += 52;
        line = w;
      } else line = test;
    }
    if (line) {
      x.fillText(line, R, y);
      y += 52;
    }
  };
  for (const p of EX.paras) {
    wrap(p);
    y += 30;
  }
  y += 60;
  // Stamp
  x.save();
  x.translate(M + 190, y + 90);
  x.rotate(-0.18);
  x.strokeStyle = "rgba(38,64,150,.78)";
  x.fillStyle = "rgba(38,64,150,.82)";
  x.lineWidth = 5;
  x.beginPath();
  x.arc(0, 0, 100, 0, Math.PI * 2);
  x.stroke();
  x.lineWidth = 2;
  x.beginPath();
  x.arc(0, 0, 82, 0, Math.PI * 2);
  x.stroke();
  x.textAlign = "center";
  x.font = `700 36px ${face}`;
  x.fillText("נוטריון", 0, 6);
  x.font = `500 22px ${face}`;
  x.fillText("כהן ושות׳", 0, 44);
  x.restore();
  // Signature
  x.strokeStyle = "#1f2d5a";
  x.lineWidth = 3;
  x.lineCap = "round";
  x.beginPath();
  const sx = R - 330;
  const sy = y + 110;
  x.moveTo(sx, sy);
  x.bezierCurveTo(sx + 40, sy - 70, sx + 70, sy + 40, sx + 110, sy - 20);
  x.bezierCurveTo(sx + 150, sy - 80, sx + 170, sy + 30, sx + 220, sy - 10);
  x.bezierCurveTo(sx + 250, sy - 35, sx + 270, sy + 10, sx + 300, sy - 5);
  x.stroke();
  x.strokeStyle = "#8a8a8a";
  x.lineWidth = 1.2;
  x.beginPath();
  x.moveTo(R - 340, sy + 40);
  x.lineTo(R, sy + 40);
  x.stroke();
  x.fillStyle = "#555";
  x.textAlign = "right";
  x.font = `400 24px ${face}`;
  x.fillText("חתימת המייפה", R, sy + 76);
  const blob = await new Promise<Blob>((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob"))),
      "image/jpeg",
      0.9,
    ),
  );
  return { blob, width: W, height: H };
}

export async function buildExample(title: string): Promise<{
  input: DocumentInput;
  scan: Blob;
}> {
  const { blob, width, height } = await drawPage();
  const transcription: Transcription = {
    blocks: [
      { type: "header", text: EX.header },
      { type: "title", text: EX.title },
      ...EX.paras.map((text) => ({ type: "paragraph" as const, text })),
      { type: "signature", text: "[חתימה] חתימת המייפה" },
      { type: "stamp", text: "נוטריון · כהן ושות׳" },
    ],
    startsMid: false,
    endsMid: false,
    notes: "",
  };
  const translation: Translation = {
    text: EX.translation,
    terms: EX.terms,
    doubts: [],
    lang: "fr",
  };
  return {
    scan: blob,
    input: {
      title,
      target: "fr",
      doctype: "poa",
      quality: "standard",
      highRes: true,
      pages: [
        {
          origin: "photo",
          source: "example.jpg",
          pdfText: null,
          textNote: null,
          width,
          height,
          hasImage: true,
          transcription,
          translation,
        },
      ],
    },
  };
}
