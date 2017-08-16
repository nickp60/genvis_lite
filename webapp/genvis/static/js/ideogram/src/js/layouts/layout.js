
// import {VerticalLayout} from './vertical-layout';
// import {HorizontalLayout} from './horizontal-layout';
// import {PairedLayout} from './paired-layout';
// import {SmallLayout} from './small-layout';

import * as d3 from 'd3';

import {ChromosomeUtil} from './../views/chromosome-util';

export class Layout {

  constructor(config, ideo) {
    this._config = config;
    this._ideo = ideo;
    this._ploidy = this._ideo._ploidy;
    this._translate = undefined;

    if ('chrSetMargin' in config) {
      this.chrSetMargin = config.chrSetMargin;
    } else {
      var k = this._config.chrMargin;
      this.chrSetMargin = (this._config.ploidy > 1 ? k : 0);
    }

    // Chromosome band's size.
    this._tickSize = 8;

    // Chromosome rotation state.
    this._isRotated = false;
  }

  // Factory method
  static getInstance(config, ideo) {
    if ('perspective' in config && config.perspective === 'comparative') {
      return new PairedLayout(config, ideo);
    } else if ('rows' in config && config.rows > 1) {
      return new SmallLayout(config, ideo);
    } else if (config.orientation === 'vertical') {
      return new VerticalLayout(config, ideo);
    } else if (config.orientation === 'horizontal') {
      return new HorizontalLayout(config, ideo);
    } else {
      return new VerticalLayout(config, ideo);
    }
  }

  // Get chart left margin
  _getLeftMargin() {
    return this._margin.left;
  }

  // Get rotated chromosome y scale
  _getYScale() {
      // 20 is width of rotated chromosome.
    return 20 / this._config.chrWidth;
  }

  // Get chromosome labels
  getChromosomeLabels(chrElement) {
    var util = new ChromosomeUtil(chrElement);

    return [util.getSetLabel(), util.getLabel()].filter(function(d) {
      return d.length > 0;
    });
  }

  // Rotate chromosome to original position
  rotateBack() {
    throw new Error(this._class + '#rotateBack not implemented');
  }

  // Rotate chromosome to opposite position
  rotateForward() {
    throw new Error(this._class + '#rotateForward not implemented');
  }

  rotate(chrSetNumber, chrNumber, chrElement) {
    var ideo = this._ideo;

      // Find chromosomes which should be hidden
    var otherChrs = d3.selectAll(ideo.selector + ' g.chromosome')
      .filter(function() {
        return this !== chrElement;
      });

    if (this._isRotated) {
          // Reset _isRotated flag
      this._isRotated = false;
          // Rotate chromosome back
      this.rotateBack(chrSetNumber, chrNumber, chrElement, function() {
              // Show all other chromosomes and chromosome labels
        otherChrs.style('display', null);
        d3.selectAll(ideo.selector + ' .chrSetLabel, .chrLabel')
          .style('display', null);
      });
    } else {
          // Set _isRotated flag
      this._isRotated = true;

          // Hide all other chromosomes and chromosome labels
      otherChrs.style('display', 'none');
      d3.selectAll(ideo.selector + ' .chrSetLabel, .chrLabel')
        .style('display', 'none');

          // Rotate chromosome
      this.rotateForward(chrSetNumber, chrNumber, chrElement);
    }
  }

  getChromosomeLabelClass() {
    if (this._config.ploidy === 1) {
      return 'chrLabel';
    } else {
      return 'chrSetLabel';
    }
  }

  _getAdditionalOffset() {
    return (
      (this._config.annotationHeight || 0) * (this._config.numAnnotTracks || 1)
    );
  }

  _getChromosomeSetSize(chrSetNumber) {
    // Get last chromosome set size.
    var setSize = this._ploidy.getSetSize(chrSetNumber);

    // Increase offset by last chromosome set size
    return (
      setSize * this._config.chrWidth * 2 + (this.chrSetMargin)
    );
  }

  // Get layout margin
  getMargin() {
    return this._margin;
  }

  // Get SVG element height
  getHeight() {
    throw new Error(this._class + '#getHeight not implemented');
  }

  getChromosomeBandTickY1() {
    throw new Error(this._class + '#getChromosomeBandTickY1 not implemented');
  }

  getChromosomeBandTickY2() {
    throw new Error(this._class + '#getChromosomeBandTickY2 not implemented');
  }

  // Get chromosome's band translate attribute
  getChromosomeBandLabelTranslate() {
    throw new Error(
      this._class + '#getChromosomeBandLabelTranslate not implemented'
    );
  }

  // Get chromosome set label anchor property
  getChromosomeSetLabelAnchor() {
    return 'middle';
  }

  // Get chromosome's band label text-anchor value
  getChromosomeBandLabelAnchor() {
    throw (
      new Error(this._class + '#getChromosomeBandLabelAnchor not implemented')
    );
  }

  getChromosomeLabelXPosition() {
    throw new Error(
      this._class + '#getChromosomeLabelXPosition not implemented'
    );
  }

  // Get chromosome label y position.
  getChromosomeLabelYPosition() {
    return -5.5;
  }

  // "i" is chromosome number
  getChromosomeSetLabelYPosition(i) {
    if (this._config.ploidy === 1) {
      return this.getChromosomeLabelYPosition(i);
    } else {
      return -2 * this._config.chrWidth;
    }
  }

  getChromosomeSetLabelXPosition() {
    throw (
      new Error(
        this._class + '#getChromosomeSetLabelXPosition not implemented'
      )
    );
  }

  getChromosomeSetLabelTranslate() {
    throw (
      new Error(this._class + '#getChromosomeSetLabelTranslate not implemented')
    );
  }

  // Get chromosome set translate attribute
  getChromosomeSetTranslate() {
    throw new Error(this._class + '#getChromosomeSetTranslate not implemented');
  }

  // Get chromosome set translate's y offset
  getChromosomeSetYTranslate() {
    throw new Error(
      this._class + '#getChromosomeSetYTranslate not implemented'
    );
  }
}



export class HorizontalLayout extends Layout {

  constructor(config, ideo) {
    super(config, ideo);
    this._class = 'HorizontalLayout';
    this._margin = {
      left: 20,
      top: 30
    };
  }

  _getLeftMargin() {
    var margin = Layout.prototype._getLeftMargin.call(this);
    if (this._config.ploidy > 1) {
      margin *= 1.8;
    }

    return margin;
  }

  rotateForward(setNumber, chrNumber, chrElement, callback) {
    var xOffset = 30;

    var ideoBox = d3.select(this._ideo.selector).node().getBoundingClientRect();
    var chrBox = chrElement.getBoundingClientRect();

    var scaleX = (ideoBox.height / (chrBox.width + xOffset / 2)) * 0.9;
    var scaleY = this._getYScale();

    var yOffset = (chrNumber + 1) * ((this._config.chrWidth * 2) * scaleY);

    var transform = (
      'rotate(90) ' +
      'translate(' + xOffset + ', -' + yOffset + ') ' +
      'scale(' + scaleX + ', ' + scaleY + ')'
    );

    d3.select(chrElement.parentNode)
      .transition()
      .attr("transform", transform)
      .on('end', callback);

    // Append new chromosome labels
    var labels = this.getChromosomeLabels(chrElement);
    d3.select(this._ideo.getSvg())
      .append('g')
      .attr('class', 'tmp')
      .selectAll('text')
      .data(labels)
      .enter()
      .append('text')
      .attr('class', function(d, i) {
        return i === 0 && labels.length === 2 ? 'chrSetLabel' : null;
      })
      .attr('x', 30)
      .attr('y', function(d, i) {
        return (i + 1 + labels.length % 2) * 12;
      })
      .style('text-anchor', 'middle')
      .style('opacity', 0)
      .text(String)
      .transition()
      .style('opacity', 1);
  }

  rotateBack(setNumber, chrNumber,
             chrElement, callback) {
    var translate = this.getChromosomeSetTranslate(setNumber);

    d3.select(chrElement.parentNode)
      .transition()
      .attr("transform", translate)
      .on('end', callback);

    d3.selectAll(this._ideo.selector + ' g.tmp')
      .style('opacity', 0)
      .remove();
  }

  getHeight(taxId) {
    // Get last chromosome set offset.
    var numChromosomes = this._config.chromosomes[taxId].length;
    var lastSetOffset = this.getChromosomeSetYTranslate(numChromosomes - 1);

    // Get last chromosome set size.
    var lastSetSize = this._getChromosomeSetSize(numChromosomes - 1);

    // Increase offset by last chromosome set size
    lastSetOffset += lastSetSize;

    return lastSetOffset + this._getAdditionalOffset() * 2;
  }

  getWidth() {
    return this._config.chrHeight + this._margin.top * 1.5;
  }

  getChromosomeSetLabelAnchor() {
    return 'end';
  }

  getChromosomeBandLabelAnchor() {
    return null;
  }

  getChromosomeBandTickY1() {
    return 2;
  }

  getChromosomeBandTickY2() {
    return 10;
  }

  getChromosomeBandLabelTranslate(band) {
    var x =
      this._ideo.round(-this._tickSize + band.px.start + band.px.width / 2);
    var y = -10;

    return {
      x: x,
      y: y,
      translate: 'translate(' + x + ',' + y + ')'
    };
  }

  getChromosomeSetLabelTranslate() {
    return null;
  }

  getChromosomeSetTranslate(setNumber) {
    var leftMargin = this._getLeftMargin();
    var chromosomeSetYTranslate = this.getChromosomeSetYTranslate(setNumber);
    return 'translate(' + leftMargin + ', ' + chromosomeSetYTranslate + ')';
  }

  getChromosomeSetYTranslate(setNumber) {
    // If no detailed description provided just use one formula for all cases.
    if (!this._config.ploidyDesc) {
      return this._config.chrMargin * (setNumber + 1);
    }

    // Id detailed description provided start to calculate offsets
    //  for each chromosome set separately. This should be done only once.
    if (!this._translate) {
      // First offset equals to zero.
      this._translate = [1];

      // Loop through description set
      for (var i = 1; i < this._config.ploidyDesc.length; i++) {
        this._translate[i] =
          this._translate[i - 1] + this._getChromosomeSetSize(i - 1);
      }
    }

    return this._translate[setNumber];
  }

  getChromosomeSetLabelXPosition(i) {
    if (this._config.ploidy === 1) {
      return this.getChromosomeLabelXPosition(i);
    } else {
      return -20;
    }
  }

  getChromosomeSetLabelYPosition(i) {
    var setSize = this._ploidy.getSetSize(i),
      config = this._config,
      chrMargin = config.chrMargin,
      chrWidth = config.chrWidth,
      y;

    if (config.ploidy === 1) {
      y = chrWidth / 2 + 3;
    } else {
      y = (setSize * chrMargin) / 2;
    }

    return y;
  }

  getChromosomeLabelXPosition() {
    return -8;
  }

  getChromosomeLabelYPosition() {
    return this._config.chrWidth;
  }

}




export class PairedLayout extends Layout {

  constructor(config, ideo) {
    super(config, ideo);

    this._class = 'PairedLayout';

    this._margin = {
      left: 30
    };
  }

  rotateForward(setNumber, chrNumber, chrElement, callback) {
    var self = this;
    var ideo = this._ideo;

    // Get ideo container and chromosome set dimensions
    var ideoBox = d3.select(ideo.selector).node().getBoundingClientRect();
    var chrBox = chrElement.getBoundingClientRect();

    // Evaluate dimensions scale coefficients
    var scaleX = (ideoBox.width / chrBox.height) * 0.97;
    var scaleY = this._getYScale();

    // Evaluate y offset of chromosome.
    // It is different for first and the second one
    var yOffset = setNumber ? 150 : 25;

    var transform =
      'translate(15, ' + yOffset + ') scale(' + scaleX + ', ' + scaleY + ')';

    // Run rotation procedure
    d3.select(chrElement.parentNode)
      .transition()
      .attr("transform", transform)
      .on('end', function() {
        // Run callback function if provided
        if (callback) {
          callback();
        }

        var translateY = (6 * Number(!setNumber));

        // Rotate band labels
        d3.select(chrElement.parentNode).selectAll('g.bandLabel text')
          .attr('transform', 'rotate(90) translate(0, ' + translateY + ')')
          .attr('text-anchor', 'middle');

        // Hide syntenic regions
        d3.selectAll(ideo.selector + ' .syntenicRegion')
          .style('display', 'none');
      });

    // Append new chromosome labels
    var labels = this.getChromosomeLabels(chrElement);

    d3.select(this._ideo.getSvg())
      .append('g')
      .attr('class', 'tmp')
      .selectAll('text')
      .data(this.getChromosomeLabels(chrElement))
      .enter()
      .append('text')
      .attr('class', function(d, i) {
        return i === 0 && labels.length === 2 ? 'chrSetLabel' : null;
      })
      .attr('x', 0)
      .attr('y', yOffset + (self._config.chrWidth * scaleX / 2) * 1.15)
      .style('opacity', 0)
      .text(String)
      .transition()
      .style('opacity', 1);
  }

  rotateBack(setNumber, chrNumber, chrElement, callback) {
    var ideo = this._ideo;

    // Get intial transformation string for chromosome set
    var translate = this.getChromosomeSetTranslate(setNumber);

    // Run rotation procedure
    d3.select(chrElement.parentNode)
      .transition()
      .attr('transform', translate)
      .on('end', function() {
        // Run callback fnuction if provided
        callback();

        // Show syntenic regions
        d3.selectAll(ideo.select + ' .syntenicRegion')
          .style('display', null);

        // Reset changed attributes to original state
        d3.select(chrElement.parentNode).selectAll('g.bandLabel text')
          .attr('transform', null)
          .attr('text-anchor', setNumber ? null : 'end');
      });

    d3.selectAll(ideo.selector + ' g.tmp')
      .style('opacity', 0)
      .remove();
  }

  getHeight() {
    return this._config.chrHeight + this._margin.left * 1.5;
  }

  getWidth() {
    return '97%';
  }

  getChromosomeBandTickY1(chrNumber) {
    return chrNumber % 2 ? this._config.chrWidth : this._config.chrWidth * 2;
  }

  getChromosomeBandTickY2(chrNumber) {
    var width = this._config.chrWidth;
    return chrNumber % 2 ? width - this._tickSize : width * 2 + this._tickSize;
  }

  getChromosomeBandLabelAnchor(chrNumber) {
    return chrNumber % 2 ? null : 'end';
  }

  getChromosomeBandLabelTranslate(band, chrNumber) {
    var x = chrNumber % 2 ? 10 : -this._config.chrWidth - 10;
    var y = this._ideo.round(band.px.start + band.px.width / 2) + 3;

    return {
      x: y,
      y: y,
      translate: 'rotate(-90) translate(' + x + ', ' + y + ')'
    };
  }

  getChromosomeLabelXPosition() {
    return -this._tickSize;
  }

  getChromosomeSetLabelXPosition() {
    return this._config.chrWidth / -2;
  }

  getChromosomeSetLabelTranslate() {
    return 'rotate(-90)';
  }

  getChromosomeSetTranslate(setNumber) {
    var chromosomeSetYTranslate = this.getChromosomeSetYTranslate(setNumber);
    return (
      'rotate(90) ' +
      'translate(' + this._margin.left + ', -' + chromosomeSetYTranslate + ')'
    );
  }

  getChromosomeSetYTranslate(setNumber) {
    return 200 * (setNumber + 1);
  }

}



export class SmallLayout extends Layout {

  constructor(config, ideo) {
    super(config, ideo);

    this._class = 'SmallLayout';

    this._margin = {
      left: 36.5,
      top: 10
    };
  }

  rotateForward(setNumber, chrNumber, chrElement, callback) {
    var ideoBox = d3.select(this._ideo.selector).node().getBoundingClientRect();
    var chrBox = chrElement.getBoundingClientRect();

    var scaleX = (ideoBox.width / chrBox.height) * 0.97;
    var scaleY = this._getYScale();

    transform = 'translate(5, 25) scale(' + scaleX + ', ' + scaleY + ')';

    d3.select(chrElement.parentNode)
      .transition()
      .attr('transform', transform)
      .on('end', callback);
  }

  rotateBack(setNumber, chrNumber, chrElement, callback) {
    var translate = this.getChromosomeSetTranslate(setNumber);

    d3.select(chrElement.parentNode)
      .transition()
      .attr('transform', translate)
      .on('end', callback);
  }

  getHeight() {
    var chrHeight = this._config.chrHeight;
    return this._config.rows * (chrHeight + this._margin.top * 1.5);
  }

  getWidth() {
    return '97%';
  }

  getChromosomeBandLabelTranslate() {

  }

  getChromosomeSetLabelTranslate() {
    return 'rotate(-90)';
  }

  getChromosomeSetTranslate(setNumber) {
    // Get organisms id list
    var organisms = [];
    this._ideo.getTaxids(function(taxIdList) {
      organisms = taxIdList;
    });
    // Get first organism chromosomes amount
    var size = this._ideo.config.chromosomes[organisms[0]].length;
    // Amount of chromosomes per number
    var rowSize = size / this._config.rows;

    var xOffset;
    var yOffset;

    if (setNumber > rowSize - 1) {
      xOffset = this._margin.left + this._config.chrHeight * 1.4;
      yOffset = this.getChromosomeSetYTranslate(setNumber - rowSize);
    } else {
      xOffset = this._margin.left;
      yOffset = this.getChromosomeSetYTranslate(setNumber);
    }

    return 'rotate(90) translate(' + xOffset + ', -' + yOffset + ')';
  }

  getChromosomeSetYTranslate(setNumber) {
    // Get additional padding caused by annotation tracks
    var additionalPadding = this._getAdditionalOffset();
    // If no detailed description provided just use one formula for all cases
    return (
      this._margin.left * (setNumber) + this._config.chrWidth +
      additionalPadding * 2 + additionalPadding * setNumber
    );
  }

  getChromosomeSetLabelXPosition(setNumber) {
    return (
      ((this._ploidy.getSetSize(setNumber) * this._config.chrWidth + 20) / -2) +
      (this._config.ploidy > 1 ? 0 : this._config.chrWidth)
    );
  }

  getChromosomeLabelXPosition() {
    return this._config.chrWidth / -2;
  }

}




export class VerticalLayout extends Layout {

  constructor(config, ideo) {
    super(config, ideo);
    this._class = 'VerticalLayout';
    // Layout margins
    this._margin = {
      top: 30,
      left: 15
    };
  }

  rotateForward(setNumber, chrNumber, chrElement, callback) {
    var self = this;

    var xOffset = 20;

    var ideoBox = d3.select(this._ideo.selector).node().getBoundingClientRect();
    var chrBox = chrElement.getBoundingClientRect();

    var scaleX = (ideoBox.width / chrBox.height) * 0.97;
    var scaleY = this._getYScale();

    var transform =
      'translate(' + xOffset + ', 25) scale(' + scaleX + ', ' + scaleY + ')';

    d3.select(chrElement.parentNode)
      .transition()
      .attr('transform', transform)
      .on('end', callback);

    // Append new chromosome labels
    var labels = this.getChromosomeLabels(chrElement);
    var y = (xOffset + self._config.chrWidth) * 1.3;
    d3.select(this._ideo.getSvg())
      .append('g')
      .attr('class', 'tmp')
      .selectAll('text')
      .data(labels)
      .enter()
      .append('text')
      .attr('class', function(d, i) {
        return i === 0 && labels.length === 2 ? 'chrSetLabel' : null;
      })
      .attr('x', 0)
      .attr('y', y).style('opacity', 0)
      .text(String)
      .transition()
      .style('opacity', 1);
  }

  rotateBack(setNumber, chrNumber,
             chrElement, callback) {
    var translate = this.getChromosomeSetTranslate(setNumber);

    d3.select(chrElement.parentNode)
      .transition()
      .attr('transform', translate)
      .on('end', callback);

    d3.selectAll(this._ideo.selector + ' g.tmp')
      .style('opacity', 0)
      .remove();
  }

  getHeight() {
    return this._config.chrHeight + this._margin.top * 1.5;
  }

  getWidth() {
    return '97%';
  }

  getChromosomeBandLabelTranslate() {

  }

  getChromosomeSetLabelTranslate() {
    return 'rotate(-90)';
  }

  getChromosomeSetTranslate(setNumber) {
    var marginTop = this._margin.top;
    var chromosomeSetYTranslate = this.getChromosomeSetYTranslate(setNumber);
    return (
      'rotate(90) ' +
      'translate(' + marginTop + ', -' + chromosomeSetYTranslate + ')'
    );
  }

  getChromosomeSetYTranslate(setNumber) {
    // Get additional padding caused by annotation/histogram tracks
    var pad = this._getAdditionalOffset(),
      margin = this._config.chrMargin,
      width = this._config.chrWidth,
      translate;

    // If no detailed description provided just use one formula for all cases
    if (!this._config.ploidyDesc) {
      // TODO:
      // This part of code contains a lot magic numbers and if
      // statements for exactly corresponing to original ideogram examples.
      // But all this stuff should be removed. Calculation of translate
      // should be a simple formula applied for all cases listed below.
      // Now they are diffirent because of Layout:_getAdditionalOffset do
      // not meet for cases when no annotation, when annotation exists and
      // when histogram used

      if (this._config.annotationsLayout === 'histogram') {
        return margin / 2 + setNumber * (margin + width + 2) + pad * 2 + 1;
      } else {
        translate = width + setNumber * (margin + width) + pad * 2;
        if (pad > 0) {
          return translate;
        } else {
          return translate + 4 + (2 * setNumber);
        }
      }
    }

    // If detailed description provided start to calculate offsets
    // for each chromosome set separately. This should be done only once
    if (!this._translate) {
      // First offset equals to zero
      this._translate = [this._ploidy.getSetSize(0) * width * 2];
      var prevTranslate;
      // Loop through description set
      for (var i = 1; i < this._config.ploidyDesc.length; i++) {
        prevTranslate = this._translate[i - 1];
        this._translate[i] = prevTranslate + this._getChromosomeSetSize(i - 1);
      }
    }

    return this._translate[setNumber];
  }

  getChromosomeSetLabelXPosition() {
    return (this._config.chrWidth * this._config.ploidy) / -2;
  }

  getChromosomeLabelXPosition() {
    return this._config.chrWidth / -2;
  }
}
