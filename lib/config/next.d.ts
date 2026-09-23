import { NextConfig } from 'next';
import { Configuration } from 'webpack';

export interface WebpackOptions {
  isServer?: boolean;
  appDir?: string;
}

export declare function configureWebpack(
  config: Configuration,
  options: WebpackOptions
): Configuration;
