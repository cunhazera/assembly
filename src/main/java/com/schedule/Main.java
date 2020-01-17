package com.schedule;

import com.schedule.business.AssemblyScheduler;

import java.io.IOException;
import java.net.URISyntaxException;

public class Main {

    private AssemblyScheduler scheduler = new AssemblyScheduler();

    public static void main(String[] args) throws URISyntaxException, IOException {
        Main main = new Main();
        main.scheduler.createProductionLines(args[0]).forEach(System.out::println);
    }

}
