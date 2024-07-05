'use client'
import React from 'react'
import { Grid, JsonViewer } from '@typestackapp/core/components/util'
import { context } from '@typestackapp/core/components/global'
import '@typestackapp/core/next/public/tsapp.css'

export default function UserLoginPage() {
  const ctx = React.useContext(context)

  return (
    <Grid heading={{ title: "Flexbox Admin Template", size: "h1" }}>
      <Grid>
        <Grid heading={{ title: "Clean CSS Code", size: "h2" }}>
          <ul>
            <li>no position: absolute</li>
            <li>no float</li>
            <li>no clearfix</li>
            <li>no faux columns</li>
            <li>no javascript</li>
          </ul>
        </Grid>
        <Grid heading={{ title: "Font Awesome", size: "h2" }}>
          <ul>
            <li>no images</li>
            <li>no extra retina sprites</li>
          </ul>
        </Grid>
        <Grid heading={{ title: "SCSS", size: "h2" }}>
          <ul>
            <li>no headache</li>
          </ul>
        </Grid>
      </Grid>

      <Grid>
        <Grid heading={{ title: "Headline", size: "h2" }}>
          Some Content1
        </Grid>

        <Grid heading={{ title: "Headline", size: "h2" }}>
          Some Content2
        </Grid>
      </Grid>

      <Grid>
        <Grid heading={{ title: "Context config", size: "h2" }}>
          <JsonViewer data={ctx.config} space={2} />
        </Grid>
      </Grid>

    </Grid>
  )
}