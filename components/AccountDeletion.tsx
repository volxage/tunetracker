import {FlatList, TouchableHighlight, View} from "react-native";
import {ButtonText, DeleteButton, SMarginView, SafeBgView, SubText, Text, Title} from "../Style";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {useNavigation} from "@react-navigation/native";
import {useContext, useEffect, useState} from "react";
import http from "../http-to-server";
import {AxiosError, isAxiosError} from "axios";
import OnlineDB from "../OnlineDB";
import {composer, submitted_composer_draft, submitted_tune_draft, tune_draft} from "../types";
import InformationExpand from "./InformationExpand";
import dateDisplay from "../textconverters/dateDisplay";
import {useTheme} from "styled-components";
import {Button} from "../simple_components/Button";
