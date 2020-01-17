package com.schedule.business;

import org.junit.Test;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class AssemblySchedulerTest {

    private AssemblyScheduler scheduler = new AssemblyScheduler();

    @Test
    public void testMainDataFromProductionLine() throws IOException, URISyntaxException {
        List<String> lines = scheduler.createProductionLines(getClass().getClassLoader().getResource("input4lines.txt").getPath());
        assertThat(lines.get(1), startsWith("09:00"));
        assertThat(lines.indexOf("12:00 Almoço"), not(-1));
        Integer last = Integer.valueOf(lines.get(lines.size() - 1).substring(0, 2));
        assertThat(last, greaterThan(15));
        assertThat(last, lessThan(18));
        assertThat(lines.stream().filter(e -> e.contains("Linha de montagem")).count(), equalTo(4l));
    }

}
