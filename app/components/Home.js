import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.module.css';
import Autocomplete from "react-autocomplete";
import TwoWaveform from "./RenderWaveform.js";
export default class Home extends Component {
  render() {
    return (
      <div>
        <div className={styles.container}>
          <h2>Thomash</h2>
          <Link to="/counter">to Counter</Link>
          // <TwoWaveform type="webgl" />
        </div>
      </div>
    );
  }
}
