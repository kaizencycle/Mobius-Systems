"use client";

import React from "react";

export default function Sparkline({
  data, width=120, height=28, stroke="currentColor"
}: { data:number[]; width?:number; height?:number; stroke?:string }) {
  if (!data || data.length===0) return <svg width={width} height={height}/>;
  const max = Math.max(1, ...data);
  const stepX = width / (data.length - 1);
  const toY = (v:number) => height - (v / max) * (height - 2) - 1;

  let d = "";
  data.forEach((v,i)=>{
    const x = i * stepX;
    const y = toY(v);
    d += (i===0? "M":"L") + x + " " + y + " ";
  });

  return (
    <svg width={width} height={height} style={{display:"block"}}>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}
