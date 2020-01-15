package com.schedule;

import com.schedule.business.AssemblyScheduler;
import com.schedule.entity.Assembly;
import com.schedule.map.AssemblyMap;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;

public class Main {

    private AssemblyScheduler scheduler = new AssemblyScheduler();

    public static void main(String[] args) throws URISyntaxException, IOException {
        Main main = new Main();
        main.scheduler.createProductionLines();
    }

}
